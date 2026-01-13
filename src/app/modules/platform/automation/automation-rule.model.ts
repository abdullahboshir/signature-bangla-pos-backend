import { Schema, model } from 'mongoose';
import { contextScopePlugin } from '@core/plugins/context-scope.plugin.js';

export type TriggerType = 'ORDER_CREATED' | 'ORDER_UPDATED' | 'USER_REGISTERED' | 'CART_ABANDONED' | 'INVENTORY_LOW';

export interface IAutomationAction {
    type: 'SEND_SMS' | 'SEND_EMAIL' | 'ADD_TAG' | 'NOTIFY_STAFF';
    payload: Record<string, any>; // e.g. { templateId: '...', recipient: '...' }
}

export interface IAutomationCondition {
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'lt' | 'contains';
    value: any;
}

export interface IAutomationRule {
    name: string;
    module: 'pos' | 'erp' | 'hrm' | 'ecommerce' | 'crm' | 'logistics' | 'system';
    trigger: TriggerType;
    conditions: IAutomationCondition[];
    actions: IAutomationAction[];
    isActive: boolean;
    businessUnit: Schema.Types.ObjectId;
    description?: string;
    lastTriggeredAt?: Date;
    triggeredCount?: number;
}

const automationRuleSchema = new Schema<IAutomationRule>({
    name: { type: String, required: true },
    module: {
        type: String,
        enum: ['pos', 'erp', 'hrm', 'ecommerce', 'crm', 'logistics', 'system'],
        required: true
    },
    trigger: {
        type: String,
        required: true,
        enum: ['ORDER_CREATED', 'ORDER_UPDATED', 'USER_REGISTERED', 'CART_ABANDONED', 'INVENTORY_LOW']
    },
    conditions: [{
        field: { type: String, required: true },
        operator: { type: String, required: true, enum: ['eq', 'neq', 'gt', 'lt', 'contains'] },
        value: { type: Schema.Types.Mixed, required: true }
    }],
    actions: [{
        type: { type: String, required: true, enum: ['SEND_SMS', 'SEND_EMAIL', 'ADD_TAG', 'NOTIFY_STAFF'] },
        payload: { type: Schema.Types.Mixed }
    }],
    isActive: { type: Boolean, default: true },
    businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true },
    description: { type: String },
    lastTriggeredAt: { type: Date },
    triggeredCount: { type: Number, default: 0 },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
});

automationRuleSchema.index({ businessUnit: 1, trigger: 1 });
automationRuleSchema.index({ isActive: 1 });

// Apply Context-Aware Data Isolation
automationRuleSchema.plugin(contextScopePlugin, {
    businessUnitField: 'businessUnit'
});

export const AutomationRule = model<IAutomationRule>('AutomationRule', automationRuleSchema);
