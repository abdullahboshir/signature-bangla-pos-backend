import "colors";
import { QueueService } from "../modules/platform/queue/queue.service.ts";
import { QUEUE_NAMES } from "../modules/platform/queue/queue.interface.ts";

/**
 * Industrial Standard Job Manager
 * Orchestrates all background maintenance tasks using Bull repeatable jobs.
 */
export class JobManager {
    /**
     * Initialize all background jobs
     * These are registered once in the primary process.
     */
    static async initAll() {
        console.log("🛠️  Initializing Industrial Job Manager...".cyan.bold);

        // 1. Stock Alert Job (Every Midnight)
        await this.scheduleJob('stock-alert', '0 0 * * *');

        // 2. Daily Sales Summary (Every Day at 1 AM)
        await this.scheduleJob('sales-summary', '0 1 * * *');

        // 3. Database Backup Automation (Every Sunday at 2 AM)
        await this.scheduleJob('db-backup', '0 2 * * 0');

        // 4. Inactive Client Reminder (1st of every Month at 3 AM)
        await this.scheduleJob('inactive-reminder', '0 3 1 * *');

        // 5. Audit Log Archiving (Quarterly - 1st of every Year/Quarter at 4 AM)
        await this.scheduleJob('log-archive', '0 4 1 */3 *');

        // 6. Stock Reconciliation (Daily at 5 AM)
        await this.scheduleJob('stock-recon', '0 5 * * *');

        // 7. Currency Sync (Daily at 6 AM)
        await this.scheduleJob('currency-sync', '0 6 * * *');

        // 8. Security Review (Monthly - 1st at 7 AM)
        await this.scheduleJob('security-audit', '0 7 1 * *');

        // 9. Data Retention Cleanup (Daily at 8 AM)
        await this.scheduleJob('cleanup', '0 8 * * *');

        // Special: Subscription Expiration (Replaces manual setInterval)
        // Runs every 24 hours
        await this.scheduleJob('subscription-maintenance', '0 0 * * *');

        console.log("✅ All Maintenance Jobs Registered Successfully".green);
    }

    /**
     * Schedules a repeatable job in the MAINTENANCE queue
     */
    private static async scheduleJob(taskName: string, cron: string) {
        try {
            const maintenanceQueue = QueueService.queues[QUEUE_NAMES.MAINTENANCE];
            if (!maintenanceQueue) return;

            // Remove existing jobs to avoid duplicates if cron changes
            // Bull handles this if 'jobId' is consistent, but clean approach is better
            await maintenanceQueue.add(
                taskName,
                { taskName },
                {
                    repeat: { cron },
                    jobId: `repeatable:${taskName}`, // Consistent ID prevents duplicates
                    removeOnComplete: true,
                }
            );
            console.log(`   🔸 Scheduled: ${taskName.padEnd(25)} [${cron}]`.gray);
        } catch (error: any) {
            console.error(`   ❌ Failed to schedule ${taskName}:`.red, error.message);
        }
    }
}
