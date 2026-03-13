import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

// GET /berths — List all berths
router.get("/", async (_req, res) => {
  try {
    const berths = await prisma.berth.findMany({
      include: {
        vesselCalls: {
          where: {
            status: { in: ["ARRIVED", "BERTHED", "OPERATIONS"] },
          },
          select: {
            id: true,
            vesselName: true,
            imoNumber: true,
            status: true,
            eta: true,
          },
          take: 1,
        },
        _count: {
          select: { vesselCalls: true },
        },
      },
      orderBy: { code: "asc" },
    });

    const result = berths.map((berth) => ({
      ...berth,
      currentVessel: berth.vesselCalls[0] || null,
      isOccupied: berth.vesselCalls.length > 0,
    }));

    res.json(result);
  } catch (error) {
    console.error("Error fetching berths:", error);
    res.status(500).json({ error: "Failed to fetch berths" });
  }
});

// GET /berths/:id — Get single berth
router.get("/:id", async (req, res) => {
  try {
    const berth = await prisma.berth.findUnique({
      where: { id: req.params.id },
      include: {
        vesselCalls: {
          orderBy: { eta: "desc" },
          take: 10,
          select: {
            id: true,
            vesselName: true,
            imoNumber: true,
            status: true,
            eta: true,
            atd: true,
          },
        },
      },
    });
    if (!berth) return res.status(404).json({ error: "Berth not found" });
    res.json(berth);
  } catch (error) {
    console.error("Error fetching berth:", error);
    res.status(500).json({ error: "Failed to fetch berth" });
  }
});

export { router as berthRouter };
