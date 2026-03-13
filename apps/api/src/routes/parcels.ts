import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, AuthRequest, requireRole } from "../middleware/auth";

export const parcelRouter = Router();

parcelRouter.use(authenticate);

// PUT /api/v1/parcels/:id — Update parcel
parcelRouter.put(
  "/:id",
  requireRole("ADMIN", "TERMINAL_MANAGER", "PLANNER"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { productId, nominatedVolume, owner, qualitySpec, tempRequirement, status } = req.body;

      const parcel = await prisma.parcel.update({
        where: { id: req.params.id },
        data: {
          ...(productId && { productId }),
          ...(nominatedVolume && { nominatedVolume }),
          ...(owner !== undefined && { owner }),
          ...(qualitySpec !== undefined && { qualitySpec }),
          ...(tempRequirement !== undefined && { tempRequirement }),
          ...(status && { status }),
        },
        include: { product: true, transferRecords: true },
      });

      res.json(parcel);
    } catch (error) {
      res.status(500).json({ message: "Failed to update parcel" });
    }
  }
);

// DELETE /api/v1/parcels/:id — Delete parcel (only if no transfer)
parcelRouter.delete(
  "/:id",
  requireRole("ADMIN", "TERMINAL_MANAGER", "PLANNER"),
  async (req: AuthRequest, res: Response) => {
    try {
      const parcel = await prisma.parcel.findUnique({
        where: { id: req.params.id },
        include: { transferRecords: true },
      });

      if (!parcel) {
        return res.status(404).json({ message: "Parcel not found" });
      }

      if (parcel.transferRecords.length > 0) {
        return res.status(409).json({
          message: "Cannot delete parcel with existing transfer records",
        });
      }

      await prisma.parcel.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete parcel" });
    }
  }
);

// POST /api/v1/parcels/:id/allocate-tank — Allocate tank to parcel
parcelRouter.post(
  "/:id/allocate-tank",
  requireRole("ADMIN", "TERMINAL_MANAGER", "PLANNER"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { tankId } = req.body;
      const parcelId = req.params.id;

      const parcel = await prisma.parcel.findUnique({
        where: { id: parcelId },
        include: { product: true },
      });

      if (!parcel) {
        return res.status(404).json({ message: "Parcel not found" });
      }

      const tank = await prisma.tank.findUnique({
        where: { id: tankId },
        include: { compatibleProducts: true },
      });

      if (!tank) {
        return res.status(404).json({ message: "Tank not found" });
      }

      // Check tank is available
      if (tank.status !== "AVAILABLE") {
        return res.status(409).json({
          message: `Tank ${tank.code} is not available (current status: ${tank.status})`,
        });
      }

      // Check capacity
      const availableCapacity = tank.capacityM3 - tank.currentLevelM3;
      if (availableCapacity < parcel.nominatedVolume) {
        return res.status(409).json({
          message: `Insufficient capacity. Available: ${availableCapacity.toFixed(1)} m³, Required: ${parcel.nominatedVolume} m³`,
        });
      }

      // Check product compatibility
      const isCompatible = tank.compatibleProducts.some(tp => tp.productId === parcel.productId);
      if (!isCompatible) {
        return res.status(409).json({
          message: `Tank ${tank.code} is not compatible with product ${parcel.product.name}`,
        });
      }

      // Allocate
      await prisma.$transaction([
        prisma.parcel.update({
          where: { id: parcelId },
          data: { allocatedTankId: tankId, status: "ALLOCATED" },
        }),
        prisma.tank.update({
          where: { id: tankId },
          data: { status: "ALLOCATED" },
        }),
      ]);

      const updated = await prisma.parcel.findUnique({
        where: { id: parcelId },
        include: { product: true },
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to allocate tank" });
    }
  }
);
