import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, AuthRequest, requireRole } from "../middleware/auth";

export const vesselCallRouter = Router();

vesselCallRouter.use(authenticate);

// GET /api/v1/vessel-calls — List all vessel calls
vesselCallRouter.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const { page = "1", limit = "25", status, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (req.user?.terminalId) where.terminalId = req.user.terminalId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { vesselName: { contains: search as string, mode: "insensitive" } },
        { imoNumber: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.vesselCall.findMany({
        where,
        include: {
          berth: true,
          parcels: { include: { product: true } },
          _count: { select: { parcels: true, documents: true } },
        },
        orderBy: { eta: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.vesselCall.count({ where }),
    ]);

    res.json({ data, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch vessel calls" });
  }
});

// GET /api/v1/vessel-calls/:id — Get vessel call detail
vesselCallRouter.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const vesselCall = await prisma.vesselCall.findUnique({
      where: { id: req.params.id },
      include: {
        berth: true,
        parcels: {
          include: { product: true, transferRecords: true },
        },
        documents: true,
      },
    });

    if (!vesselCall) {
      return res.status(404).json({ message: "Vessel call not found" });
    }

    res.json(vesselCall);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch vessel call" });
  }
});

// POST /api/v1/vessel-calls — Create vessel call
vesselCallRouter.post(
  "/",
  requireRole("ADMIN", "TERMINAL_MANAGER", "PLANNER"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { vesselName, imoNumber, eta, berthId, agent, notes } = req.body;
      const terminalId = req.user?.terminalId;

      if (!terminalId) {
        return res.status(400).json({ message: "User must be assigned to a terminal" });
      }

      // Validate berth availability
      if (berthId) {
        const conflicting = await prisma.vesselCall.findFirst({
          where: {
            berthId,
            status: { in: ["SCHEDULED", "ARRIVED", "BERTHED", "OPERATIONS"] },
            eta: {
              gte: new Date(new Date(eta).getTime() - 24 * 60 * 60 * 1000),
              lte: new Date(new Date(eta).getTime() + 24 * 60 * 60 * 1000),
            },
          },
        });

        if (conflicting) {
          return res.status(409).json({
            message: `Berth conflict: ${conflicting.vesselName} is scheduled at this berth around the same time`,
          });
        }
      }

      const vesselCall = await prisma.vesselCall.create({
        data: {
          vesselName,
          imoNumber,
          eta: new Date(eta),
          berthId,
          agent,
          notes,
          terminalId,
        },
        include: { berth: true },
      });

      res.status(201).json(vesselCall);
    } catch (error) {
      res.status(500).json({ message: "Failed to create vessel call" });
    }
  }
);

// PUT /api/v1/vessel-calls/:id — Update vessel call
vesselCallRouter.put(
  "/:id",
  requireRole("ADMIN", "TERMINAL_MANAGER", "PLANNER"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { vesselName, imoNumber, eta, ata, atd, berthId, agent, status, notes } = req.body;

      const vesselCall = await prisma.vesselCall.update({
        where: { id: req.params.id },
        data: {
          ...(vesselName && { vesselName }),
          ...(imoNumber && { imoNumber }),
          ...(eta && { eta: new Date(eta) }),
          ...(ata && { ata: new Date(ata) }),
          ...(atd && { atd: new Date(atd) }),
          ...(berthId && { berthId }),
          ...(agent && { agent }),
          ...(status && { status }),
          ...(notes !== undefined && { notes }),
        },
        include: { berth: true, parcels: { include: { product: true } } },
      });

      res.json(vesselCall);
    } catch (error) {
      res.status(500).json({ message: "Failed to update vessel call" });
    }
  }
);

// GET /api/v1/vessel-calls/:id/parcels — List parcels for a vessel call
vesselCallRouter.get("/:id/parcels", async (req: AuthRequest, res: Response) => {
  try {
    const parcels = await prisma.parcel.findMany({
      where: { vesselCallId: req.params.id },
      include: { product: true, transferRecords: true },
      orderBy: { createdAt: "asc" },
    });
    res.json(parcels);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch parcels" });
  }
});

// POST /api/v1/vessel-calls/:id/parcels — Create parcel
vesselCallRouter.post(
  "/:id/parcels",
  requireRole("ADMIN", "TERMINAL_MANAGER", "PLANNER"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { productId, nominatedVolume, owner, qualitySpec, tempRequirement } = req.body;

      const parcel = await prisma.parcel.create({
        data: {
          vesselCallId: req.params.id,
          productId,
          nominatedVolume,
          owner,
          qualitySpec,
          tempRequirement,
        },
        include: { product: true },
      });

      res.status(201).json(parcel);
    } catch (error) {
      res.status(500).json({ message: "Failed to create parcel" });
    }
  }
);
