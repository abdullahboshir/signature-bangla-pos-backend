import { Server } from "http";
import cluster from "cluster";
import os from "os";
import "colors";
import app from "./app.js";
import mongoose from "mongoose";
import { connectDB } from "./core/database/mongoose/connection.ts";
import { seedCategories } from "./core/database/mongoose/seeders/category.seeder.ts";
import { runRolePermissionSeeder } from "./core/database/mongoose/seeders/auth/index.ts";
import { runSettingsSeeder } from "./core/database/mongoose/seeders/settings/index.ts";

import appConfig from "./shared/config/app.config.ts";
import { startCleanupJob } from "./app/jobs/cleanup.job.ts";
import { WorkerService } from "./app/modules/platform/queue/worker.service.ts";

let server: Server;

const numCPUs = Number(process.env['WORKERS']) || os.cpus().length;

async function bootstrap() {
  try {
    if (cluster.isPrimary) {
      console.log(`🌟 Primary Process ${process.pid} is running`.yellow.bold);

      // 1. Connect DB for Primary (Needed for Seeders/Cron)
      await connectDB();

      // 1.1 Pre-create collections & indexes (Critical for atomic seeding on fresh DB)
      // Index creation cannot run inside a transaction.
      console.log("📦 Initializing Collections & Indexes...".gray);
      const models = mongoose.modelNames();
      for (const modelName of models) {
        await mongoose.model(modelName).createCollection();
      }
      console.log("✅ Collections Initialized".green);

      // 2. Run Seeders (Atomic Transaction)
      // 2. Run Seeders (Atomic Transaction removed for stability)
      console.log("🌱 Running Seeders...".blue);
      // const session = await mongoose.startSession(); // Transaction disabled to avoid 'yielding disabled' write conflicts
      try {
        // session.startTransaction();

        await runRolePermissionSeeder(); // Internally handles Roles, Groups, and Super Admin User
        await seedCategories();
        await runSettingsSeeder(); // Atomic System & Platform Settings

        // await session.commitTransaction();
        console.log("✅ All Seeders Completed Successfully".green.bold);
      } catch (error: any) {
        console.error("❌ Seeding Failed:", error.message);
        // await session.abortTransaction();
        // process.exit(1); // Don't exit dev server on seed fail, just log
      } finally {
        // session.endSession();
      }

      // 3. Start Global Cron Jobs (Only once or centralized)
      console.log("⏰ Starting Maintenance Jobs...".blue);
      startCleanupJob();

      // 4. Fork Workers
      // NOTE: If using an external process manager like PM2 or Kubernetes (ReplicaSet),
      // DISABLE this internal clustering to avoid port conflicts and let the infrastructure handle scaling.
      // Set WORKERS=0 or use separate entry point for production.
      console.log(`🚀 Forking ${numCPUs} workers for full scalability...`.green);
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }

      cluster.on("exit", (worker, _code, _signal) => {
        console.log(`💀 Worker ${worker.process.pid} died. Restarting...`.red);
        cluster.fork();
      });

    } else {
      // WORKER PROCESS
      // 1. Connect DB (Each worker needs its own connection pool)
      await connectDB();

      // 2. Initialize Queue Workers (Distributed processing)
      // Workers compete for jobs, which is good for scale.
      // OPTIMIZATION: Check if this node should run background workers
      if (process.env['ENABLE_QUEUE'] !== "false") { // Default true for simplicity unless explicitly disabled
        WorkerService.initWorkers();
      }

      // 3. Start HTTP Server
      server = app.listen(appConfig.port, () => {
        console.log(`🚀 Worker ${process.pid} serving on port ${appConfig.port}`.green);
      });
    }
  } catch (err: any) {
    console.log("❌ Startup error:".red, err?.message);
    process.exit(1);
  }
}

bootstrap();

// Graceful Shutdown Logic
const shutdown = (_code: number, _signal: string) => {
  console.log(`🛑 Worker ${process.pid} shutting down...`.yellow);
  if (server) {
    server.close(() => {
      console.log("HTTTP Server closed");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// Error handling
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});
