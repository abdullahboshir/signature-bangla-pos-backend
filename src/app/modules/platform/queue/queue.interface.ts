
export const QUEUE_NAMES = {
    EMAIL: 'email-queue',
    AUTOMATION: 'automation-queue',
    DATA_EXPORT: 'data-export-queue',
    MAINTENANCE: 'maintenance-queue', // [NEW] Centralized maintenance tasks
} as const;

export type TQueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

export interface IEmailJobPayload {
    to: string;
    subject: string;
    templateId?: string;
    template?: string; // Standardized for system templates
    body?: string;
    context?: Record<string, any>; // For template rendering
    data?: Record<string, any>;
}

export interface IAutomationJobPayload {
    triggerType: string;
    data: Record<string, any>;
    businessUnitId: string;
}

export interface IMaintenanceJobPayload {
    taskName: string;
    options?: Record<string, any>;
}

export type TJobData = IEmailJobPayload | IAutomationJobPayload | IMaintenanceJobPayload;
