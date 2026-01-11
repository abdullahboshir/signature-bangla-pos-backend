import { SystemSettings } from "../../../../../app/modules/platform/settings/system-settings/system-settings.model.js";
import "colors";

/**
 * 🛠️ System Settings Seeder
 * Ensures the infrastructural backbone is initialized.
 * Idempotent: Only creates if not exists.
 */
export const seedSystemSettings = async (session?: any) => {
    try {
        console.log("⚙️  Seeding System Settings...".blue);

        const existing = await SystemSettings.findOne().session(session || null);
        if (!existing) {
            await (SystemSettings as any).getSettings(session);
            console.log("   ✅ Initialized Industrial System Core".green);
        } else {
            console.log("   ℹ️ System Core already exists".gray);
        }
    } catch (error: any) {
        console.error("❌ System Settings Seeding Failed:".red, error?.message);
        throw error;
    }
};
