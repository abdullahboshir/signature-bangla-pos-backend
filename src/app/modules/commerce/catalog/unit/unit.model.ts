import { Schema, model } from 'mongoose';
import type { IUnit, UnitModel } from './unit.interface.ts';
import { contextScopePlugin } from '@core/plugins/context-scope.plugin.js';

const unitSchema = new Schema<IUnit, UnitModel>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },
        symbol: {
            type: String,
            required: true,
            trim: true,
            maxlength: 20,
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
        company: {
            type: Schema.Types.ObjectId,
            ref: 'Company',
            required: false,
            index: true
        },
        businessUnit: {
            type: Schema.Types.ObjectId,
            ref: 'BusinessUnit',
            required: false,
            default: null,
            index: true
        },
        relatedBusinessTypes: {
            type: [String],
            default: [],
        },
        module: {
            type: String,
            enum: ['pos', 'erp', 'hrm', 'ecommerce', 'crm', 'logistics', 'system'],
            default: 'system',
            required: true,
            index: true
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
        },
    }
);

// Unique compound index: same unit name/symbol within same business unit should be unique
unitSchema.index({ name: 1, businessUnit: 1 }, { unique: true });
unitSchema.index({ symbol: 1, businessUnit: 1 }, { unique: true });
unitSchema.index({ status: 1 });
unitSchema.index({ businessUnit: 1 });

export const Unit = model<IUnit, UnitModel>('Unit', unitSchema);

// Apply Context-Aware Data Isolation
unitSchema.plugin(contextScopePlugin, {
    companyField: 'company',
    businessUnitField: 'businessUnit'
});
