import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";

import globalErrorHandler from "./core/middleware/global-error-handler.ts";
import notFound from "./core/middleware/not-found.ts";

import router from "./app/routes/index.ts";

import appConfig from "./shared/config/app.config.ts";

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:3001"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "x-business-unit-id", "x-outlet-id"],
  })
);
app.use(compression());

// Serve Static Files
import path from "path";
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));



const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// 4. REQUEST PARSERS
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// 5. LOGGING
if (appConfig.NODE_ENV === "development") {
  app.use(morgan("dev")); // Detailed logs for development
} else {
  app.use(morgan("combined")); // Standard logs for production
}

// 6. HEALTH CHECK (Before API routes)
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is healthy 🟢",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: appConfig.NODE_ENV,
  });
});

app.use("/api", router);

app.get("/", (_req, res) => {
  res.status(200).json({
    message: "🚀 Welcome to Signature Bangla POS API",
    status: "Running",
    version: "v1.0.0",
    documentation: "/api/v1/docs",
    timestamp: new Date().toISOString(),
    processId: process.pid,
  });
});

import { QueueService } from "./app/modules/queue/queue.service.ts";
import { QUEUE_NAMES } from "./app/modules/queue/queue.interface.ts";
import { CacheManager } from "./core/utils/caching/cache-manager.ts";

// TEMP: Verification Route
app.get("/test-scalability", async (_req, res) => {
  try {
    // 1. Test Cache
    await CacheManager.set("verification-check", { status: "Cache Working" }, 60);
    const cacheResult = await CacheManager.get("verification-check");

    // 2. Test Queue
    await QueueService.addJob(QUEUE_NAMES.EMAIL, "verification-email", {
      to: "admin@signature-bangla.com",
      subject: "Verification",
      body: `Processed by Worker ${process.pid}`,
    });

    res.json({
      success: true,
      message: "Scalability Verification Complete",
      worker_process_id: process.pid,
      cache_check: cacheResult,
      queue_check: "Job Dispatched to 'email-queue'",
      note: "Check terminal logs for '✅ Redis HIT' and '📨 Processing Email Job'",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.use(notFound);
app.use(globalErrorHandler);

export default app;
