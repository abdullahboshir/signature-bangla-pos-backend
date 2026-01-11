import mongoose from "mongoose";
import "colors";
import { seedSystemSettings } from "./system-settings.seeder.js";
import { seedPlatformSettings } from "./platform-settings.seeder.js";

/**
 * 🛡️ Atomic Core Settings Seeder Orchestrator
 * Ensures System and Platform settings are seeded together or not at all.
 * Uses Mongoose Transactions for data integrity.
 */
export async function runSettingsSeeder() {
    console.log("--- 🏗️  Atomic Settings Seeder Started ---".blue.bold);

    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        // 1. Seed System Settings
        await seedSystemSettings(session);

        // 2. Seed Platform Settings
        await seedPlatformSettings(session);

        await session.commitTransaction();
        console.log("✅ Core Settings Seeding Completed Atomically".green.bold);
    } catch (error: any) {
        await session.abortTransaction();
        console.error("❌ Atomic Settings Seeding Failed. Rolled back changes.".red.bold);
        console.error(`   Error: ${error.message}`.red);
        // We throw the error so the main bootstrap process is aware of the failure
        throw error;
    } finally {
        session.endSession();
        console.log("--- 🏁 Atomic Settings Seeder Finished ---".blue.bold);
    }
}
