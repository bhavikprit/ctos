import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, AuthRequest, requireRole } from "../middleware/auth";
import { TransferStatus } from "@prisma/client";

export const transferRouter = Router();

transferRouter.use(authenticate);

// Valid state transitions
const VALID_TRANSITIONS: Record<TransferStatus, TransferStatus[]> = {
  PLANNED: ["AWAITING_CHECKLIST"],
  AWAITING_CHECKLIST: ["READY"],
  READY: ["IN_PROGRESS"],
  IN_PROGRESS: ["PAUSED", "COMPLETING"],
  PAUSED: ["IN_PROGRESS", "TERMINATED"],
  COMPLETING: ["PENDING_CLOSURE"],
  PENDING_CLOSURE: ["COMPLETED"],
  COMPLETED: [],
  TERMINATED: [],
};

// Helper: generate transfer number
async function generateTransferNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.transferRecord.count({
    where: {
      transferNumber: { startsWith: `TRF-${year}` },
    },
  });
  return `TRF-${year}-${String(count + 1).padStart(4, "0")}`;
}

// Helper: log transfer event
async function logEvent(
  transferId: string,
  eventType: string,
  userId: string | undefined,
  value?: string,
  notes?: string
) {
  await prisma.transferEvent.create({
    data: {
      transferId,
      eventType: eventType as any,
      userId: userId || undefined,
      value,
      notes,
    },
  });
}

// GET /api/v1/transfers — List all transfers
transferRouter.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const { page = "1", limit = "25", status, type, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (req.user?.terminalId) where.terminalId = req.user.terminalId;
    if (status) where.status = status;
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { transferNumber: { contains: search as string, mode: "insensitive" } },
      ];
    }

    // Field operators can only see their own transfers
    if (req.user?.role === "FIELD_OPERATOR") {
      where.events = { some: { userId: req.user.id } };
    }

    const [data, total] = await Promise.all([
      prisma.transferRecord.findMany({
        where,
        include: {
          parcel: { include: { product: true, vesselCall: true } },
          route: true,
          _count: { select: { events: true, ullageReadings: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.transferRecord.count({ where }),
    ]);

    res.json({ data, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transfers" });
  }
});

// GET /api/v1/transfers/:id — Get transfer detail
transferRouter.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const transfer = await prisma.transferRecord.findUnique({
      where: { id: req.params.id },
      include: {
        parcel: {
          include: { product: true, vesselCall: { include: { berth: true } } },
        },
        route: true,
        events: {
          orderBy: { timestamp: "desc" },
          take: 50,
          include: { user: { select: { id: true, name: true, role: true } } },
        },
        ullageReadings: {
          orderBy: { timestamp: "desc" },
          take: 20,
        },
        shipFigures: {
          orderBy: { timestamp: "desc" },
          take: 20,
        },
        flowReadings: {
          orderBy: { timestamp: "desc" },
          take: 20,
        },
        isgottChecklist: {
          include: { items: { orderBy: { itemNumber: "asc" } } },
        },
        shoreConnections: true,
        certificate: true,
        variance: true,
        communications: {
          orderBy: { timestamp: "asc" },
          include: { user: { select: { id: true, name: true, role: true } } },
        },
      },
    });

    if (!transfer) {
      return res.status(404).json({ message: "Transfer not found" });
    }

    res.json(transfer);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transfer" });
  }
});

// POST /api/v1/transfers — Create transfer
transferRouter.post(
  "/",
  requireRole("ADMIN", "TERMINAL_MANAGER", "PLANNER"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { parcelId, type, sourceType, sourceId, destType, destId, plannedVolume } = req.body;
      const terminalId = req.user?.terminalId;

      if (!terminalId) {
        return res.status(400).json({ message: "User must be assigned to a terminal" });
      }

      const transferNumber = await generateTransferNumber();

      const transfer = await prisma.transferRecord.create({
        data: {
          transferNumber,
          parcelId,
          type,
          sourceType,
          sourceId,
          destType,
          destId,
          plannedVolume,
          terminalId,
        },
        include: {
          parcel: { include: { product: true } },
        },
      });

      await logEvent(transfer.id, "TRANSFER_CREATED", req.user?.id, JSON.stringify({
        type, plannedVolume, sourceType, sourceId, destType, destId,
      }));

      res.status(201).json(transfer);
    } catch (error) {
      res.status(500).json({ message: "Failed to create transfer" });
    }
  }
);

// PUT /api/v1/transfers/:id/status — Change transfer status (state machine)
transferRouter.put(
  "/:id/status",
  requireRole("ADMIN", "TERMINAL_MANAGER", "OPERATIONS_MANAGER", "FIELD_OPERATOR"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { status: newStatus, reason } = req.body;
      const transferId = req.params.id;

      const transfer = await prisma.transferRecord.findUnique({
        where: { id: transferId },
      });

      if (!transfer) {
        return res.status(404).json({ message: "Transfer not found" });
      }

      // Validate transition
      const allowed = VALID_TRANSITIONS[transfer.status];
      if (!allowed.includes(newStatus)) {
        return res.status(400).json({
          message: `Invalid status transition: ${transfer.status} → ${newStatus}. Allowed: ${allowed.join(", ")}`,
        });
      }

      // Resume from PAUSED requires supervisor
      if (transfer.status === "PAUSED" && newStatus === "IN_PROGRESS") {
        if (!["ADMIN", "TERMINAL_MANAGER", "OPERATIONS_MANAGER"].includes(req.user!.role)) {
          return res.status(403).json({
            message: "Resume requires supervisor authorization",
          });
        }
      }

      const updateData: any = { status: newStatus };

      if (newStatus === "IN_PROGRESS" && !transfer.startTime) {
        updateData.startTime = new Date();
      }
      if (newStatus === "COMPLETED" || newStatus === "TERMINATED") {
        updateData.endTime = new Date();
      }

      const updated = await prisma.transferRecord.update({
        where: { id: transferId },
        data: updateData,
        include: {
          parcel: { include: { product: true } },
        },
      });

      // Map status to event type
      const eventTypeMap: Record<string, string> = {
        IN_PROGRESS: transfer.status === "PAUSED" ? "TRANSFER_RESUMED" : "TRANSFER_STARTED",
        PAUSED: "TRANSFER_PAUSED",
        COMPLETING: "TRANSFER_COMPLETED",
        TERMINATED: "TRANSFER_TERMINATED",
      };

      const eventType = eventTypeMap[newStatus];
      if (eventType) {
        await logEvent(transferId, eventType, req.user?.id, undefined, reason);
      }

      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update transfer status" });
    }
  }
);

// POST /api/v1/transfers/:id/emergency-stop — Emergency stop
transferRouter.post(
  "/:id/emergency-stop",
  requireRole("ADMIN", "TERMINAL_MANAGER", "OPERATIONS_MANAGER", "FIELD_OPERATOR"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { reason } = req.body;
      const transferId = req.params.id;

      if (!reason) {
        return res.status(400).json({ message: "Reason is required for emergency stop" });
      }

      const transfer = await prisma.transferRecord.findUnique({
        where: { id: transferId },
      });

      if (!transfer) {
        return res.status(404).json({ message: "Transfer not found" });
      }

      if (transfer.status !== "IN_PROGRESS") {
        return res.status(400).json({
          message: "Emergency stop only available for in-progress transfers",
        });
      }

      const updated = await prisma.transferRecord.update({
        where: { id: transferId },
        data: { status: "PAUSED" },
      });

      await logEvent(transferId, "EMERGENCY_STOP", req.user?.id, JSON.stringify({
        reason, previousStatus: transfer.status,
      }), `EMERGENCY STOP: ${reason}`);

      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to execute emergency stop" });
    }
  }
);

// POST /api/v1/transfers/:id/flow-rate — Record flow rate
transferRouter.post(
  "/:id/flow-rate",
  requireRole("ADMIN", "TERMINAL_MANAGER", "OPERATIONS_MANAGER", "FIELD_OPERATOR"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { flowRate, segmentId } = req.body;
      const transferId = req.params.id;

      const reading = await prisma.flowReading.create({
        data: {
          transferId,
          pipelineSegmentId: segmentId,
          flowRateM3h: flowRate,
        },
      });

      // Update current flow rate on transfer
      await prisma.transferRecord.update({
        where: { id: transferId },
        data: { flowRateM3h: flowRate },
      });

      await logEvent(transferId, "FLOW_RATE_CHANGE", req.user?.id, JSON.stringify({
        flowRate, segmentId,
      }));

      res.status(201).json(reading);
    } catch (error) {
      res.status(500).json({ message: "Failed to record flow rate" });
    }
  }
);

// POST /api/v1/transfers/:id/ullage — Record ullage reading
transferRouter.post(
  "/:id/ullage",
  requireRole("ADMIN", "TERMINAL_MANAGER", "OPERATIONS_MANAGER", "FIELD_OPERATOR"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { tankId, readingType, value, temperature } = req.body;

      const reading = await prisma.ullageReading.create({
        data: {
          transferId: req.params.id,
          tankId,
          readingType,
          valueM3: value,
          temperatureC: temperature,
          observedBy: req.user!.id,
        },
      });

      await logEvent(req.params.id, "ULLAGE_READING", req.user?.id, JSON.stringify({
        tankId, readingType, value, temperature,
      }));

      res.status(201).json(reading);
    } catch (error) {
      res.status(500).json({ message: "Failed to record ullage" });
    }
  }
);

// GET /api/v1/transfers/:id/ullage — Get ullage readings
transferRouter.get("/:id/ullage", async (req: AuthRequest, res: Response) => {
  try {
    const readings = await prisma.ullageReading.findMany({
      where: { transferId: req.params.id },
      orderBy: { timestamp: "desc" },
    });
    res.json(readings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch ullage readings" });
  }
});

// POST /api/v1/transfers/:id/ship-figures — Record ship figure
transferRouter.post(
  "/:id/ship-figures",
  requireRole("ADMIN", "TERMINAL_MANAGER", "OPERATIONS_MANAGER"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { volume, method, notes } = req.body;

      const figure = await prisma.shipFigure.create({
        data: {
          transferId: req.params.id,
          reportedBy: req.user!.id,
          volumeM3: volume,
          method,
          notes,
        },
      });

      await logEvent(req.params.id, "SHIP_FIGURE_RECORDED", req.user?.id, JSON.stringify({
        volume, method,
      }));

      res.status(201).json(figure);
    } catch (error) {
      res.status(500).json({ message: "Failed to record ship figure" });
    }
  }
);

// GET /api/v1/transfers/:id/variance — Get running variance
transferRouter.get("/:id/variance", async (req: AuthRequest, res: Response) => {
  try {
    const transferId = req.params.id;

    // Get latest shore and ship figures
    const latestUllage = await prisma.ullageReading.findMany({
      where: { transferId },
      orderBy: { timestamp: "desc" },
    });

    const latestShipFigure = await prisma.shipFigure.findFirst({
      where: { transferId },
      orderBy: { timestamp: "desc" },
    });

    // Calculate shore received (sum of ullage changes)
    const openingUllage = latestUllage.find(u => u.readingType === "opening");
    const currentUllage = latestUllage.find(u => u.readingType === "current") || latestUllage[0];
    
    const shoreReceived = currentUllage && openingUllage
      ? currentUllage.valueM3 - openingUllage.valueM3
      : 0;

    const shipDischarged = latestShipFigure?.volumeM3 || 0;
    const variance = shoreReceived - shipDischarged;
    const variancePct = shipDischarged > 0 ? (variance / shipDischarged) * 100 : 0;

    res.json({
      shoreReceived: Math.round(shoreReceived * 100) / 100,
      shipDischarged: Math.round(shipDischarged * 100) / 100,
      varianceM3: Math.round(variance * 100) / 100,
      variancePct: Math.round(variancePct * 1000) / 1000,
      status: Math.abs(variancePct) > 0.5 ? "critical" : Math.abs(variancePct) > 0.3 ? "warning" : "normal",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to calculate variance" });
  }
});

// GET /api/v1/transfers/:id/events — Get event log
transferRouter.get("/:id/events", async (req: AuthRequest, res: Response) => {
  try {
    const events = await prisma.transferEvent.findMany({
      where: { transferId: req.params.id },
      include: { user: { select: { id: true, name: true, role: true } } },
      orderBy: { timestamp: "desc" },
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

// POST /api/v1/transfers/:id/communications — Add communication
transferRouter.post(
  "/:id/communications",
  async (req: AuthRequest, res: Response) => {
    try {
      const { message } = req.body;

      const comm = await prisma.communication.create({
        data: {
          transferId: req.params.id,
          userId: req.user!.id,
          message,
        },
        include: { user: { select: { id: true, name: true, role: true } } },
      });

      await logEvent(req.params.id, "COMMUNICATION", req.user?.id, undefined, message);

      res.status(201).json(comm);
    } catch (error) {
      res.status(500).json({ message: "Failed to add communication" });
    }
  }
);

// GET /api/v1/transfers/:id/communications — Get communications
transferRouter.get("/:id/communications", async (req: AuthRequest, res: Response) => {
  try {
    const communications = await prisma.communication.findMany({
      where: { transferId: req.params.id },
      include: { user: { select: { id: true, name: true, role: true } } },
      orderBy: { timestamp: "asc" },
    });
    res.json(communications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch communications" });
  }
});

// POST /api/v1/transfers/:id/isgott — Create ISGOTT checklist
transferRouter.post(
  "/:id/isgott",
  requireRole("ADMIN", "TERMINAL_MANAGER", "OPERATIONS_MANAGER"),
  async (req: AuthRequest, res: Response) => {
    try {
      const transferId = req.params.id;

      // Check if checklist already exists
      const existing = await prisma.isgottChecklist.findUnique({
        where: { transferId },
      });

      if (existing) {
        return res.status(409).json({ message: "ISGOTT checklist already exists for this transfer" });
      }

      // Create checklist with default items (subset of ISGOTT 7th Edition)
      const checklist = await prisma.isgottChecklist.create({
        data: {
          transferId,
          items: {
            create: [
              // Part A — Ship/Shore Joint
              { section: "A", itemNumber: 1, description: "Ship is securely moored" },
              { section: "A", itemNumber: 2, description: "Emergency towing-off pennants are correctly rigged and clearly visible" },
              { section: "A", itemNumber: 3, description: "Ship/shore communication system is operative and tested" },
              { section: "A", itemNumber: 4, description: "Oil spill containment equipment is in place" },
              { section: "A", itemNumber: 5, description: "Cargo hoses/arms are in good condition and properly connected" },
              { section: "A", itemNumber: 6, description: "Emergency shutdown procedure is understood and agreed" },
              { section: "A", itemNumber: 7, description: "Cargo transfer rate and maximum pressure are agreed" },
              { section: "A", itemNumber: 8, description: "Vapour return system is connected and tested (if applicable)" },
              { section: "A", itemNumber: 9, description: "Fire-fighting equipment is positioned and ready for immediate use" },
              { section: "A", itemNumber: 10, description: "Scuppers are effectively plugged" },
              { section: "A", itemNumber: 11, description: "Smoking regulations are understood and being enforced" },
              { section: "A", itemNumber: 12, description: "Naked light regulations are understood and being enforced" },
              { section: "A", itemNumber: 13, description: "Shore-to-ship gangway is safe and in good condition" },
              { section: "A", itemNumber: 14, description: "All cargo tank lids closed except those in use" },
              { section: "A", itemNumber: 15, description: "Drip trays under manifold connections are in position" },
              // Part B — Terminal only
              { section: "B", itemNumber: 1, description: "Pipeline system has been checked and is correctly set for the transfer" },
              { section: "B", itemNumber: 2, description: "All valves in the transfer route verified open/closed as required" },
              { section: "B", itemNumber: 3, description: "Receiving tank level is within safe limits for the planned transfer" },
              { section: "B", itemNumber: 4, description: "Tank farm fire protection systems are operational" },
              { section: "B", itemNumber: 5, description: "Emergency response team is on standby" },
              { section: "B", itemNumber: 6, description: "All shore electrical equipment in the hazardous zone is certified" },
              { section: "B", itemNumber: 7, description: "Environmental monitoring is in place" },
              { section: "B", itemNumber: 8, description: "Product Material Safety Data Sheet available at the control room" },
            ],
          },
        },
        include: { items: { orderBy: { itemNumber: "asc" } } },
      });

      await logEvent(transferId, "CHECKLIST_COMPLETED", req.user?.id);

      res.status(201).json(checklist);
    } catch (error) {
      res.status(500).json({ message: "Failed to create ISGOTT checklist" });
    }
  }
);

// GET /api/v1/transfers/:id/isgott — Get ISGOTT checklist
transferRouter.get("/:id/isgott", async (req: AuthRequest, res: Response) => {
  try {
    const checklist = await prisma.isgottChecklist.findUnique({
      where: { transferId: req.params.id },
      include: { items: { orderBy: [{ section: "asc" }, { itemNumber: "asc" }] } },
    });

    if (!checklist) {
      return res.status(404).json({ message: "Checklist not found" });
    }

    res.json(checklist);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch checklist" });
  }
});

// POST /api/v1/transfers/:id/complete — Mark transfer complete
transferRouter.post(
  "/:id/complete",
  requireRole("ADMIN", "TERMINAL_MANAGER", "OPERATIONS_MANAGER"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { closingMeterReading } = req.body;
      const transferId = req.params.id;

      const transfer = await prisma.transferRecord.findUnique({
        where: { id: transferId },
      });

      if (!transfer || transfer.status !== "IN_PROGRESS") {
        return res.status(400).json({ message: "Transfer must be IN_PROGRESS to complete" });
      }

      const updated = await prisma.transferRecord.update({
        where: { id: transferId },
        data: {
          status: "COMPLETING",
          actualVolume: closingMeterReading,
        },
      });

      await logEvent(transferId, "TRANSFER_COMPLETED", req.user?.id, JSON.stringify({
        closingMeterReading,
      }));

      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to complete transfer" });
    }
  }
);

// POST /api/v1/transfers/:id/close — Close transfer
transferRouter.post(
  "/:id/close",
  requireRole("ADMIN", "TERMINAL_MANAGER", "OPERATIONS_MANAGER"),
  async (req: AuthRequest, res: Response) => {
    try {
      const transferId = req.params.id;

      const transfer = await prisma.transferRecord.findUnique({
        where: { id: transferId },
        include: { variance: true },
      });

      if (!transfer) {
        return res.status(404).json({ message: "Transfer not found" });
      }

      if (transfer.status !== "PENDING_CLOSURE") {
        return res.status(400).json({ message: "Transfer must be in PENDING_CLOSURE to close" });
      }

      // Check if variance is resolved
      if (transfer.variance && Math.abs(transfer.variance.variancePct) > 0.5 && !transfer.variance.explanation) {
        return res.status(400).json({
          message: "Transfer cannot be closed with unresolved variance above tolerance",
        });
      }

      const updated = await prisma.transferRecord.update({
        where: { id: transferId },
        data: { status: "COMPLETED", endTime: new Date() },
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to close transfer" });
    }
  }
);

// POST /api/v1/transfers/:id/variance-explain — Submit variance explanation
transferRouter.post(
  "/:id/variance-explain",
  requireRole("ADMIN", "TERMINAL_MANAGER", "OPERATIONS_MANAGER"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { bolVolume, shoreVolume, shipVolume, category, explanation } = req.body;
      const transferId = req.params.id;

      const variancePct = shipVolume > 0 ? ((shoreVolume - shipVolume) / shipVolume) * 100 : 0;

      const variance = await prisma.transferVariance.upsert({
        where: { transferId },
        create: {
          transferId,
          bolVolume,
          shoreVolume,
          shipVolume,
          variancePct,
          category,
          explanation,
          resolvedBy: req.user!.id,
          resolvedAt: new Date(),
        },
        update: {
          bolVolume,
          shoreVolume,
          shipVolume,
          variancePct,
          category,
          explanation,
          resolvedBy: req.user!.id,
          resolvedAt: new Date(),
        },
      });

      res.json(variance);
    } catch (error) {
      res.status(500).json({ message: "Failed to submit variance explanation" });
    }
  }
);
