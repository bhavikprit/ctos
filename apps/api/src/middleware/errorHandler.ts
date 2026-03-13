import { Request, Response, NextFunction } from "express";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error("Error:", err.message);
  console.error(err.stack);

  if (err.name === "ZodError") {
    return res.status(400).json({
      message: "Validation error",
      errors: JSON.parse(err.message),
    });
  }

  if (err.name === "PrismaClientKnownRequestError") {
    return res.status(400).json({
      message: "Database error",
      detail: err.message,
    });
  }

  res.status(500).json({
    message: process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message,
  });
}
