import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "@config/env";
import { createLogger } from "@ai-news-aggregator/shared";

// Import routes
import feedRoutes from "./routes/feed";
import itemRoutes from "./routes/item";
import draftsRoutes from "./routes/drafts";
import preferencesRoutes from "./routes/preferences";
import sourcesRoutes from "./routes/sources";
import roundupsRoutes from "./routes/roundups";
import scheduleRoutes from "./routes/schedule";
import eventsRoutes from "./routes/events";
import adminRoutes from "./routes/admin";
import healthRoutes from "./routes/health";

// Import middleware
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";
import { authMiddleware } from "./middleware/auth";

const app = express();
const logger = createLogger("backend");
const PORT = env.PORT;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin:
      env.NODE_ENV === "production"
        ? ["https://your-domain.com"]
        : [env.FRONTEND_URL, "http://localhost:5173"],
    credentials: true,
  }),
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Health check routes
app.use("/health", healthRoutes);

// API routes
app.use("/api/feed", feedRoutes);
app.use("/api/item", itemRoutes);
app.use("/api/drafts", draftsRoutes);
app.use("/api/preferences", authMiddleware, preferencesRoutes);
app.use("/api/sources", authMiddleware, sourcesRoutes);
app.use("/api/roundups", authMiddleware, roundupsRoutes);
app.use("/api/schedule", authMiddleware, scheduleRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/admin", adminRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
    logger.info(`Health check: http://localhost:${PORT}/health`);
  });
}

export default app;
