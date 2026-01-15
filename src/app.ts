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

import { maintenanceMode } from "./core/middleware/maintenance.middleware.js";
app.use(maintenanceMode);

if (appConfig.trust_proxy) {
  app.enable("trust proxy");
}

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(
  cors({
    origin: appConfig.cors_origin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "x-business-unit-id", "x-outlet-id"],
  })
);
app.use(compression());

// Serve Static Files
import path from "path";
app.use("/uploads", express.static(path.join(process.cwd(), "storage/uploads")));

const limiter = rateLimit({
  windowMs: appConfig.misc.rate_limit.window_ms,
  max: appConfig.misc.rate_limit.max_requests,
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false }, // Trusted proxy is handled globally
});

app.use(limiter);

// 4. REQUEST PARSERS
app.use(express.json({ limit: appConfig.max_upload_size }));
app.use(express.urlencoded({ extended: true, limit: appConfig.max_upload_size }));
app.use(cookieParser(appConfig.cookie_secret));

// 4.1 CONTEXT RESOLVER (Must be after body parsers to read req.body)
import { contextMiddleware } from "./core/middleware/context.middleware.ts";
app.use(contextMiddleware);

// 5. LOGGING
if (appConfig.NODE_ENV === "development") {
  app.use(morgan("dev")); // Detailed logs for development
} else {
  app.use(morgan("combined")); // Standard logs for production
}

// 6. HEALTH CHECK (Before API routes)
import { ApiResponse } from "./core/utils/api-response.ts";

app.get("/health", (_req, res) => {
  ApiResponse.success(res, {
    status: "OK",
    uptime: process.uptime(),
    environment: appConfig.NODE_ENV,
  }, "Server is healthy 🟢");
});

app.use("/api", router);

app.get("/", (_req, res) => {
  ApiResponse.success(res, {
    message: "🚀 Welcome to Unified Solution API",
    status: "Running",
    version: "v1.0.0",
    documentation: "/api/v1/docs",
    processId: process.pid,
  });
});

import { QueueService } from "./app/modules/platform/queue/queue.service.ts";
import { QUEUE_NAMES } from "./app/modules/platform/queue/queue.interface.ts";
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

    ApiResponse.success(res, {
      worker_process_id: process.pid,
      cache_check: cacheResult,
      queue_check: "Job Dispatched to 'email-queue'",
      note: "Check terminal logs for '✅ Redis HIT' and '📨 Processing Email Job'",
    }, "Scalability Verification Complete");
  } catch (error: any) {
    ApiResponse.error(res, error.message, "VERIFICATION_ERROR", 500);
  }
});

app.use(notFound);
app.use(globalErrorHandler);

export default app;
