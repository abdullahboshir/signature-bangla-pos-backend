import Queue from 'bull';
import config from '@shared/config/app.config.ts';
import { QUEUE_NAMES, type TQueueName, type TJobData } from './queue.interface.ts';

// Map to hold initialized queues
const queues: Record<string, Queue.Queue> = {};

/**
 * Initialize all defined queues
 */
const initQueues = () => {
    Object.values(QUEUE_NAMES).forEach((queueName) => {
        // Bull uses connection string directly or redis options
        queues[queueName] = new Queue(queueName, config.redis_url, {
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
                removeOnComplete: true, // Keep memory clean
                removeOnFail: false,    // Keep failed jobs for inspection
            },
        });

        queues[queueName].on('error', (error) => {
            console.error(`❌ Queue ${queueName} Error:`, error);
        });
    });
};

/**
 * Add a job to a specific queue
 * @param queueName Name of the queue
 * @param jobName Name of the job
 * @param data Job payload
 */
const addJob = async (queueName: TQueueName, jobName: string, data: TJobData) => {
    const queue = queues[queueName];
    if (!queue) {
        throw new Error(`Queue ${queueName} not found!`);
    }
    // Bull add syntax: queue.add(data, opts) or queue.add(name, data, opts)
    // We use named jobs
    return await queue.add(jobName, data);
};

// Initialize on load
initQueues();

export const QueueService = {
    addJob,
    queues,
};
