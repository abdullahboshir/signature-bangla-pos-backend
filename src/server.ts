import { Server } from "http";
import "colors";
import app from "./app.js";
import { connectDB } from "./core/database/mongoose/connection.ts";
import { runRolePermissionSeeder } from "./core/database/mongoose/seeders/authorization.seeder.ts";
import { seedSuperAdmin } from "./core/database/mongoose/seeders/superAdmin.seeder.ts";
import appConfig from "./shared/config/app.config.ts";

let server: Server;

async function main() {
  try {
    // Connect to database
    await connectDB();

    // Run seeders
    await runRolePermissionSeeder();
    await seedSuperAdmin();

    server = app.listen(appConfig.port, () => {
      console.log(`🚀 Server running on port ${appConfig.port}`.green);
      console.log(`📚 Environment: ${appConfig.NODE_ENV}`.blue);
    });
  } catch (err: any) {
    console.log("❌ Server startup error:".red, err?.message);
    process.exit(1);
  }
}

main();

// Error handling (keep as is)
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
