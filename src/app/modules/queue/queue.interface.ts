
export const QUEUE_NAMES = {
    EMAIL: 'email-queue',
    AUTOMATION: 'automation-queue',
    DATA_EXPORT: 'data-export-queue',
} as const;

export type TQueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

export interface IEmailJobPayload {
    to: string;
    subject: string;
    templateId?: string;
    body: string;
    data?: Record<string, any>;
}

export interface IAutomationJobPayload {
    triggerType: string;
    data: Record<string, any>;
    businessUnitId: string;
}

export type TJobData = IEmailJobPayload | IAutomationJobPayload;
