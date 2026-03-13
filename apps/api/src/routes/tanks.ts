import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, AuthRequest, requireRole } from "../middleware/auth";

export const tankRouter = Router();

tankRouter.use(authenticate);

// GET /api/v1/tanks — List all tanks
tankRouter.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const { status, search } = req.query;
    const where: any = {};

    if (req.user?.terminalId) where.terminalId = req.user.terminalId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { code: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const tanks = await prisma.tank.findMany({
      where,
      include: {
        compatibleProducts: { include: { product: true } },
      },
      orderBy: { code: "asc" },
    });

    // Calculate fill percentage and status for each tank
    const enriched = tanks.map((tank) => ({
      ...tank,
      fillPercentage: Math.round((tank.currentLevelM3 / tank.capacityM3) * 100),
      hlaPercentage: Math.round((tank.hlaM3 / tank.capacityM3) * 100),
      hhlaPercentage: Math.round((tank.hhlaM3 / tank.capacityM3) * 100),
      availableCapacity: tank.capacityM3 - tank.currentLevelM3,
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tanks" });
  }
});

// GET /api/v1/tanks/:id — Get tank detail
tankRouter.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const tank = await prisma.tank.findUnique({
      where: { id: req.params.id },
      include: {
        compatibleProducts: { include: { product: true } },
        ullageReadings: {
          orderBy: { timestamp: "desc" },
          take: 10,
        },
      },
    });

    if (!tank) {
      return res.status(404).json({ message: "Tank not found" });
    }

    res.json({
      ...tank,
      fillPercentage: Math.round((tank.currentLevelM3 / tank.capacityM3) * 100),
      availableCapacity: tank.capacityM3 - tank.currentLevelM3,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tank" });
  }
});

// POST /api/v1/tanks/recommend — Get tank recommendations
tankRouter.post(
  "/recommend",
  requireRole("ADMIN", "TERMINAL_MANAGER", "PLANNER"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { productId, volume } = req.body;
      const terminalId = req.user?.terminalId;

      if (!terminalId) {
        return res.status(400).json({ message: "User must be assigned to a terminal" });
      }

      // Find compatible tanks
      const compatibleTanks = await prisma.tank.findMany({
        where: {
          terminalId,
          status: "AVAILABLE",
          compatibleProducts: {
            some: { productId },
          },
        },
        include: {
          compatibleProducts: { include: { product: true } },
        },
        orderBy: { capacityM3: "desc" },
      });

      // Score and sort recommendations
      const recommendations = compatibleTanks
        .map((tank) => {
          const availableCapacity = tank.capacityM3 - tank.currentLevelM3;
          const capacityFit = volume / availableCapacity; // 1.0 = perfect fit
          const hasCapacity = availableCapacity >= volume;

          return {
            ...tank,
            availableCapacity,
            fillPercentage: Math.round((tank.currentLevelM3 / tank.capacityM3) * 100),
            hasCapacity,
            capacityFit: Math.round(capacityFit * 100),
            score: hasCapacity ? (1 - Math.abs(1 - capacityFit)) * 100 : 0,
            reason: hasCapacity
              ? `${availableCapacity.toFixed(0)} m³ available (${Math.round(capacityFit * 100)}% fill after transfer)`
              : `Insufficient capacity: ${availableCapacity.toFixed(0)} m³ available, ${volume} m³ needed`,
          };
        })
        .sort((a, b) => b.score - a.score);

      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  }
);

// POST /api/v1/tanks/:id/release — Release tank lock
tankRouter.post(
  "/:id/release",
  requireRole("ADMIN", "TERMINAL_MANAGER"),
  async (req: AuthRequest, res: Response) => {
    try {
      const tank = await prisma.tank.update({
        where: { id: req.params.id },
        data: { status: "AVAILABLE" },
      });

      res.json(tank);
    } catch (error) {
      res.status(500).json({ message: "Failed to release tank" });
    }
  }
);
