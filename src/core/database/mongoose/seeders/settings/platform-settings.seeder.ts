import { PlatformSettings } from "../../../../../app/modules/platform/settings/platform-settings/platform-settings.model.js";
import "colors";

/**
 * 🌐 Platform Settings Seeder
 * Ensures global branding and governance are initialized.
 * Idempotent: Only creates if not exists.
 */
export const seedPlatformSettings = async (session?: any) => {
    try {
        console.log("🏙️  Seeding Platform Settings...".blue);

        const existing = await PlatformSettings.findOne().session(session || null);
        if (!existing) {
            await (PlatformSettings as any).getSettings(session);
            console.log("   ✅ Initialized Global Platform Governance".green);
        } else {
            console.log("   ℹ️ Platform Governance already exists".gray);
        }
    } catch (error: any) {
        console.error("❌ Platform Settings Seeding Failed:".red, error?.message);
        throw error;
    }
};
