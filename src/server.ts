import { Server } from "http";
import cluster from "cluster";
import os from "os";
import "colors";
import app from "./app.js";
import { connectDB } from "./core/database/mongoose/connection.ts";
import { runRolePermissionSeeder } from "./core/database/mongoose/seeders/authorization.seeder.ts";
import { seedSuperAdmin } from "./core/database/mongoose/seeders/superAdmin.seeder.ts";
import appConfig from "./shared/config/app.config.ts";
import { startCleanupJob } from "./app/jobs/cleanup.job.ts";
import { WorkerService } from "./app/modules/queue/worker.service.ts";

let server: Server;

const numCPUs = os.cpus().length;

async function bootstrap() {
  try {
    if (cluster.isPrimary) {
      console.log(`🌟 Primary Process ${process.pid} is running`.yellow.bold);

      // 1. Connect DB for Primary (Needed for Seeders/Cron)
      await connectDB();

      // 2. Run Seeders (Only once)
      console.log("🌱 Running Seeders...".blue);
      await runRolePermissionSeeder();
      await seedSuperAdmin();

      // 3. Start Global Cron Jobs (Only once or centralized)
      console.log("⏰ Starting Maintenance Jobs...".blue);
      startCleanupJob();

      // 4. Fork Workers
      console.log(`🚀 Forking ${numCPUs} workers for full scalability...`.green);
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }

      cluster.on("exit", (worker, code, signal) => {
        console.log(`💀 Worker ${worker.process.pid} died. Restarting...`.red);
        cluster.fork();
      });

    } else {
      // WORKER PROCESS
      // 1. Connect DB (Each worker needs its own connection pool)
      await connectDB();

      // 2. Initialize Queue Workers (Distributed processing)
      // Workers compete for jobs, which is good for scale.
      WorkerService.initWorkers();

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
