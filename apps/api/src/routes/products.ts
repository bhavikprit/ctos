import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

// GET /products — List all products
router.get("/", async (_req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        _count: { select: { tankProducts: true } },
      },
      orderBy: { name: "asc" },
    });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET /products/:id — Get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        tankProducts: {
          include: { tank: true },
        },
      },
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// POST /products — Create product
router.post("/", async (req, res) => {
  try {
    const { name, code, density, flashPoint, hazardClass, color, vocRegulated, maxTemp, minTemp, terminalId } = req.body;
    const product = await prisma.product.create({
      data: { name, code, density, flashPoint, hazardClass, color: color || "#3B82F6", vocRegulated, maxTemp, minTemp, terminalId },
    });
    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// PATCH /products/:id — Update product
router.patch("/:id", async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE /products/:id — Delete product
router.delete("/:id", async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export { router as productRouter };
