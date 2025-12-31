import "colors";
import { Product } from "../modules/commerce/catalog/product/domain/product-core/product-core.model.js";
import { deleteProductService } from "../modules/commerce/catalog/product/domain/product-core/product-core.service.js";
import { Category } from "../modules/commerce/catalog/category/category.model.js";

import BusinessUnit from "../modules/platform/organization/business-unit/core/business-unit.model.js";


import { SystemSettingsService } from "../modules/platform/settings/system-settings/system-settings.service.js";

export const startCleanupJob = () => {
    // Run every 24 hours (24 * 60 * 60 * 1000 ms)
    const INTERVAL_MS = 24 * 60 * 60 * 1000;

    console.log("Cleanup Job: Initialized. Will run every 24 hours.".cyan);

    setInterval(async () => {
        console.log("Cleanup Job: Starting daily cleanup...".blue);

        try {
            // Get retention period from system settings
            const settings = await SystemSettingsService.getSystemSettings();

            if (!settings) {
                console.warn("System settings not found. Skipping cleanup.");
                return;
            }

            if (!settings.isRetentionPolicyEnabled) {
                console.log("Cleanup job skipped: Data Retention Policy is disabled.");
                return;
            }

            const retentionDays = settings.softDeleteRetentionDays || 365;
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

            console.log(`Cleanup Job: Deleting data older than ${retentionDays} days (before ${cutoffDate.toISOString()})`.cyan);

            // ===========================================
            // 1. Cleanup Products
            // ===========================================
            const productsToDelete = await Product.find({
                isDeleted: true,
                deletedAt: { $lt: cutoffDate }
            }).select('_id');

            if (productsToDelete.length > 0) {
                console.log(`Cleanup Job: Found ${productsToDelete.length} products to delete.`);
                for (const product of productsToDelete) {
                    try {
                        // Use service to ensure sub-documents are also deleted
                        await deleteProductService((product._id as any).toString(), true);
                    } catch (err: any) {
                        console.error(`Cleanup Job warning: Failed to delete product ${product._id}:`.yellow, err?.message);
                    }
                }
            }

            // ===========================================
            // 2. Cleanup Categories (Basic Hard Delete)
            // ===========================================
            const categoriesResult = await Category.deleteMany({
                isDeleted: true,
                deletedAt: { $lt: cutoffDate }
            });
            if (categoriesResult.deletedCount > 0) {
                console.log(`Cleanup Job: Permanently deleted ${categoriesResult.deletedCount} categories.`);
            }



            // ===========================================
            // 3. Cleanup Business Units
            // ===========================================
            const buResult = await BusinessUnit.deleteMany({
                isDeleted: true,
                deletedAt: { $lt: cutoffDate }
            });

            if (buResult.deletedCount > 0) {
                console.log(`Cleanup Job: Permanently deleted ${buResult.deletedCount} business units.`);
            }

            console.log("Cleanup Job: Finished daily run.".green);

        } catch (error: any) {
            console.error("Cleanup Job Error:".red, error?.message);
        }
    }, INTERVAL_MS);
};
