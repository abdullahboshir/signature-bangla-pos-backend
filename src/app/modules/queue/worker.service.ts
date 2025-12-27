import type { Job } from 'bull';
import { QUEUE_NAMES } from './queue.interface.ts';
import { QueueService } from './queue.service.ts';
import { AutomationService } from '@app/modules/automation/automation.service.ts';
import type { IAutomationJobPayload } from './queue.interface.ts';

/**
 * Process Email Jobs
 */
const processEmailJob = async (job: Job) => {
    console.log(`📨 Processing Email Job [${job.id}]: To ${job.data.to}`);
    // Simulate heavy processing (e.g., waiting for SMTP)
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log(`✅ Email Sent to ${job.data.to}`);
};

/**
 * Process Automation Jobs
 */
const processAutomationJob = async (job: Job) => {
    const { triggerType, data, businessUnitId } = job.data as IAutomationJobPayload;
    await AutomationService.processEvent(triggerType as any, data, businessUnitId);
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

        emailQueue.on('completed', (job) => {
            // console.log(`Job ${job.id} completed!`);
        });
        emailQueue.on('failed', (job, err) => {
            console.error(`❌ Job ${job.id} failed: ${err.message}`);
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

    console.log('👷 Workers Initialized for: Email, Automation');
};

export const WorkerService = {
    initWorkers,
};
