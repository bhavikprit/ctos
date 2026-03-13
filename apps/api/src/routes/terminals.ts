import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

// GET /terminals — List all terminals
router.get("/", async (_req, res) => {
  try {
    const terminals = await prisma.terminal.findMany({
      include: {
        _count: {
          select: {
            tanks: true,
            berths: true,
            pipelines: true,
            pumps: true,
            valves: true,
            users: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
    res.json(terminals);
  } catch (error) {
    console.error("Error fetching terminals:", error);
    res.status(500).json({ error: "Failed to fetch terminals" });
  }
});

// GET /terminals/:id — Get single terminal with all infrastructure
router.get("/:id", async (req, res) => {
  try {
    const terminal = await prisma.terminal.findUnique({
      where: { id: req.params.id },
      include: {
        tanks: {
          orderBy: { code: "asc" },
        },
        berths: {
          orderBy: { code: "asc" },
        },
        pipelines: {
          include: {
            segments: true,
          },
          orderBy: { code: "asc" },
        },
        pumps: {
          orderBy: { code: "asc" },
        },
        valves: {
          orderBy: { code: "asc" },
        },
        products: {
          orderBy: { name: "asc" },
        },
        _count: {
          select: {
            tanks: true,
            berths: true,
            pipelines: true,
            pumps: true,
            valves: true,
            users: true,
            vesselCalls: true,
          },
        },
      },
    });
    if (!terminal) return res.status(404).json({ error: "Terminal not found" });
    res.json(terminal);
  } catch (error) {
    console.error("Error fetching terminal:", error);
    res.status(500).json({ error: "Failed to fetch terminal" });
  }
});

// POST /terminals — Create terminal
router.post("/", async (req, res) => {
  try {
    const { name, code, location, description } = req.body;
    const terminal = await prisma.terminal.create({
      data: { name, code, location, description },
    });
    res.status(201).json(terminal);
  } catch (error) {
    console.error("Error creating terminal:", error);
    res.status(500).json({ error: "Failed to create terminal" });
  }
});

// PATCH /terminals/:id — Update terminal
router.patch("/:id", async (req, res) => {
  try {
    const terminal = await prisma.terminal.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(terminal);
  } catch (error) {
    console.error("Error updating terminal:", error);
    res.status(500).json({ error: "Failed to update terminal" });
  }
});

// DELETE /terminals/:id — Delete terminal
router.delete("/:id", async (req, res) => {
  try {
    await prisma.terminal.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting terminal:", error);
    res.status(500).json({ error: "Failed to delete terminal" });
  }
});

// ─── INFRASTRUCTURE MANAGEMENT ─────────────────────────────────

// POST /terminals/:id/tanks — Add tank to terminal
router.post("/:id/tanks", async (req, res) => {
  try {
    const { name, code, capacityM3, tankType, heated, hlaM3, hhlaM3 } = req.body;
    const tank = await prisma.tank.create({
      data: {
        name, code, capacityM3, tankType, heated: heated || false,
        hlaM3, hhlaM3,
        terminalId: req.params.id,
      },
    });
    res.status(201).json(tank);
  } catch (error) {
    console.error("Error creating tank:", error);
    res.status(500).json({ error: "Failed to create tank" });
  }
});

// POST /terminals/:id/pipelines — Add pipeline to terminal
router.post("/:id/pipelines", async (req, res) => {
  try {
    const { name, code, diameterMm, lengthM, maxFlowRate } = req.body;
    const pipeline = await prisma.pipeline.create({
      data: {
        name, code, diameterMm, lengthM, maxFlowRate,
        terminalId: req.params.id,
      },
    });
    res.status(201).json(pipeline);
  } catch (error) {
    console.error("Error creating pipeline:", error);
    res.status(500).json({ error: "Failed to create pipeline" });
  }
});

// POST /terminals/:id/berths — Add berth to terminal
router.post("/:id/berths", async (req, res) => {
  try {
    const { name, code, maxLOA, maxDraft } = req.body;
    const berth = await prisma.berth.create({
      data: {
        name, code, maxLOA, maxDraft,
        terminalId: req.params.id,
      },
    });
    res.status(201).json(berth);
  } catch (error) {
    console.error("Error creating berth:", error);
    res.status(500).json({ error: "Failed to create berth" });
  }
});

// POST /terminals/:id/pumps — Add pump to terminal
router.post("/:id/pumps", async (req, res) => {
  try {
    const { name, code, maxFlowRate } = req.body;
    const pump = await prisma.pump.create({
      data: {
        name, code, maxFlowRate,
        terminalId: req.params.id,
      },
    });
    res.status(201).json(pump);
  } catch (error) {
    console.error("Error creating pump:", error);
    res.status(500).json({ error: "Failed to create pump" });
  }
});

// POST /terminals/:id/valves — Add valve to terminal
router.post("/:id/valves", async (req, res) => {
  try {
    const { name, code } = req.body;
    const valve = await prisma.valve.create({
      data: {
        name, code,
        terminalId: req.params.id,
      },
    });
    res.status(201).json(valve);
  } catch (error) {
    console.error("Error creating valve:", error);
    res.status(500).json({ error: "Failed to create valve" });
  }
});

export { router as terminalRouter };
