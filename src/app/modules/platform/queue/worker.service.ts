import type { Job } from 'bull';
import { QUEUE_NAMES } from './queue.interface.ts';
import { QueueService } from './queue.service.ts';
import { AutomationService } from '@app/modules/platform/automation/automation.service.ts';
import type { IAutomationJobPayload, IEmailJobPayload, IMaintenanceJobPayload } from './queue.interface.ts';
import { MailService } from '@shared/mail/mail.service.ts';
import { MailTemplates } from '@shared/mail/mail.templates.ts';
import { LicenseService } from '../license/license.service.ts';
import { MaintenanceService } from '../maintenance/maintenance.service.ts';

/**
 * Process Email Jobs
 */
const processEmailJob = async (job: Job) => {
    const { to, subject, template, context, body } = job.data as IEmailJobPayload;
    console.log(`📨 Processing Email Job [${job.id}]: To ${to} [${template || 'Raw'}]`);

    let html = body || '';

    // If a system template is specified, render it
    if (template === 'subscription-suspended' || template === 'subscription_suspended') {
        html = MailTemplates.getSubscriptionSuspendedEmail(context as any);
    } else if (template === 'subscription-grace-period' || template === 'subscription_reminder') {
        html = MailTemplates.getSubscriptionReminderEmail(context as any);
    } else if (template === 'welcome') {
        html = MailTemplates.getWelcomeEmail(context as any);
    } else if (template === 'inventory-alert' || template === 'inventory_alert') {
        html = MailTemplates.getInventoryAlertEmail(context as any);
    } else if (template === 'system-backup-success' || template === 'backup_success') {
        html = MailTemplates.getSystemBackupSuccessEmail(context as any);
    } else if (template === 'daily-sales-summary' || template === 'sales_summary') {
        html = MailTemplates.getSalesSummaryEmail(context as any);
    } else if (template === 'inactivity-engagement' || template === 'inactivity_reminder') {
        html = MailTemplates.getInactivityReminderEmail(context as any);
    }

    if (!html) {
        console.warn(`⚠️ No HTML content or valid template found for email job ${job.id}`);
        return;
    }

    // Send using real MailService
    await MailService.sendEmail(to, subject, html);
    console.log(`✅ Email Sent to ${to}`);
};

/**
 * Process Automation Jobs
 */
const processAutomationJob = async (job: Job) => {
    const { triggerType, data, businessUnitId } = job.data as IAutomationJobPayload;
    await AutomationService.processEvent(triggerType as any, data, businessUnitId);
};

/**
 * Process Centralized Maintenance Jobs (8 Tasks)
 */
const processMaintenanceJob = async (job: Job) => {
    const { taskName } = job.data as IMaintenanceJobPayload;
    console.log(`🛠️ Executing Maintenance Task: ${taskName} [${job.id}]`.cyan);

    try {
        switch (taskName) {
            case 'subscription-maintenance':
                await LicenseService.handleLicenseExpirations();
                break;
            case 'stock-alert':
                await MaintenanceService.checkStockLevels();
                break;
            case 'sales-summary':
                await MaintenanceService.generateDailySalesSummary();
                break;
            case 'db-backup':
                await MaintenanceService.performDbBackup();
                break;
            case 'inactive-reminder':
                await MaintenanceService.remindInactiveClients();
                break;
            case 'log-archive':
                await MaintenanceService.archiveAuditLogs();
                break;
            case 'stock-recon':
                await MaintenanceService.reconcileStock();
                break;
            case 'currency-sync':
                await MaintenanceService.syncCurrencyRates();
                break;
            case 'security-audit':
                await MaintenanceService.conductSecurityReview();
                break;
            case 'cleanup':
                await MaintenanceService.runDailyCleanup();
                break;
            default:
                console.warn(`⚠️ Unknown maintenance task requested: ${taskName}`);
        }
        console.log(`✅ Maintenance Task Completed: ${taskName}`.green);
    } catch (error: any) {
        console.error(`❌ Maintenance Task Failed: ${taskName}:`.red, error.message);
        throw error; // Re-throw to allow Bull's retry mechanism
    }
};

/**
 * Initialize Workers for specific queues
 * In Bull, we define the 'processor' function on the queue instance itself.
 */
const initWorkers = () => {
    // 1. Email Worker
    const emailQueue = QueueService.queues[QUEUE_NAMES.EMAIL];
    if (emailQueue) {
        // Use '*' to handle ALL named jobs (verification-email, etc)
        emailQueue.process('*', processEmailJob); // Default concurrency: 1

        emailQueue.on('completed', (_job) => {
            // console.log(`Job ${job.id} completed!`);
        });
        emailQueue.on('failed', (_job, err) => {
            console.error(`❌ Job ${_job.id} failed: ${err.message}`);
        });
    }

    // 2. Automation Worker
    const automationQueue = QueueService.queues[QUEUE_NAMES.AUTOMATION];
    if (automationQueue) {
        // Use '*' to handle dynamic event names
        automationQueue.process('*', processAutomationJob);

        automationQueue.on('failed', (job, err) => {
            console.error(`❌ Job ${job.id} failed: ${err.message}`);
        });
    }

    // 3. Maintenance Worker
    const maintenanceQueue = QueueService.queues[QUEUE_NAMES.MAINTENANCE];
    if (maintenanceQueue) {
        maintenanceQueue.process('*', processMaintenanceJob);

        maintenanceQueue.on('failed', (job, err) => {
            console.error(`❌ Maintenance Job ${job?.id} failed: ${err.message}`.red);
        });
    }

    console.log('👷 Workers Initialized for: Email, Automation, Maintenance');
};

export const WorkerService = {
    initWorkers,
};
