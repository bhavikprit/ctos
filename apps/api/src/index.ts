import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { authRouter } from "./routes/auth";
import { vesselCallRouter } from "./routes/vesselCalls";
import { parcelRouter } from "./routes/parcels";
import { tankRouter } from "./routes/tanks";
import { transferRouter } from "./routes/transfers";
import { productRouter } from "./routes/products";
import { berthRouter } from "./routes/berths";
import { terminalRouter } from "./routes/terminals";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/vessel-calls", vesselCallRouter);
app.use("/api/v1/parcels", parcelRouter);
app.use("/api/v1/tanks", tankRouter);
app.use("/api/v1/transfers", transferRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/berths", berthRouter);
app.use("/api/v1/terminals", terminalRouter);

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 CTOS API running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
