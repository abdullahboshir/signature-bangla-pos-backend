import { Schema, model } from 'mongoose';
import type { ITax } from './tax.interface.ts';
import { contextScopePlugin } from '@core/plugins/context-scope.plugin.js';

const taxSchema = new Schema<ITax>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        rate: {
            type: Number,
            required: true,
            min: 0,
        },
        type: {
            type: String,
            enum: ['percentage', 'fixed'],
            default: 'percentage',
        },
        availableModules: {
            type: [String],
            enum: ['pos', 'erp', 'hrm', 'ecommerce', 'crm', 'logistics', 'marketing', 'integrations', 'system'],
            default: ['system'],
            required: true,
            index: true
        },
        businessUnit: {
            type: Schema.Types.ObjectId,
            ref: 'BusinessUnit',
            default: null,
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
    }
);

taxSchema.index({ businessUnit: 1 });
taxSchema.index({ isActive: 1 });
taxSchema.index({ isDefault: 1 });

// Query middleware to filter out deleted docs
taxSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function (next) {
    this.find({ isDeleted: { $ne: true } });
    next();
});

// Apply Context-Aware Data Isolation
taxSchema.plugin(contextScopePlugin, {
    businessUnitField: 'businessUnit',
    includeGlobal: true  // Tax rates can be global templates
});

export const Tax = model<ITax>('Tax', taxSchema);
