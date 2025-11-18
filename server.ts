import { Server } from "http";
import mongoose from "mongoose";
import "colors";
import app from "./app.js";
import { runRolePermissionSeeder } from "./src/core/database/mongoose/seeders/authorization.seeder.js";
import { seedSuperAdmin } from "./src/core/database/mongoose/seeders/superAdmin.seeder.js";
import appConfig from "./src/shared/config/app.config.js";

let server: Server;

async function main() {
  try {
    if (!appConfig.db_url) {
      console.log("Database URL is missing".red);
      return;
    }
    const connection = await mongoose.connect(appConfig.db_url as string);

    await runRolePermissionSeeder();
    await seedSuperAdmin();

    // Get the database name
    connection?.connection?.db && connection?.connection?.db?.databaseName;

    server = app.listen(appConfig.port, () => {
      console.log(`Example app listening on port ${appConfig.port}`.green);
    });
  } catch (err: any) {
    console.log("got an error from server".red, err?.message);
  }
}

main();

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  if (server) {
    server.close(() => {
      console.log("Server is shutting down due to an unhandled rejection");
      process.exit(1);
    });
  } else {
    process.exit(1); // Exit immediately if server isn't available
  }
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
  console.error(err.stack); // Log the full stack trace
  if (server) {
    server.close(() => {
      console.log("Server is shutting down due to an uncaught exception");
      process.exit(1);
    });
  } else {
    process.exit(1); // Exit immediately if server isn't available
  }
});
