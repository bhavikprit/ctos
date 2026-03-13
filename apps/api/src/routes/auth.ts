import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, AuthRequest, generateToken } from "../middleware/auth";

export const authRouter = Router();

// POST /api/v1/auth/login — Login with userId (dev mode: no password)
authRouter.post("/login", async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, terminalId: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = generateToken(user.id);

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
});

// GET /api/v1/auth/me — Get current user
authRouter.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

// GET /api/v1/auth/users — List all users for login selector
authRouter.get("/users", async (_req, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, avatarUrl: true },
      orderBy: { role: "asc" },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});
