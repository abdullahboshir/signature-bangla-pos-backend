import { Schema, model } from 'mongoose';
import type { ISupplier } from './supplier.interface.ts';
import { contextScopePlugin } from '@core/plugins/context-scope.plugin.js';

const SupplierSchema = new Schema<ISupplier>({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    contactPerson: { type: String },
    email: { type: String },
    phone: { type: String },
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String
    },
    taxId: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    // E.g. Raw Material suppliers are 'erp', Local Vendors are 'pos'
    module: {
        type: String,
        enum: ['pos', 'erp', 'hrm', 'ecommerce', 'crm', 'logistics', 'system'],
        default: 'erp',
        required: true,
        index: true
    },
    company: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true
    },
    businessUnits: [{ type: Schema.Types.ObjectId, ref: 'BusinessUnit' }]
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (_doc, ret) {
            // delete (ret as any)._id;
            delete (ret as any).__v;
        }
    }
});

SupplierSchema.index({ businessUnits: 1 });
SupplierSchema.index({ status: 1 });
SupplierSchema.index({ email: 1 });
SupplierSchema.index({ name: 'text' }); // Text Search

export const Supplier = model<ISupplier>('Supplier', SupplierSchema);

// Apply Context-Aware Data Isolation
// Note: businessUnits is an array, so we only filter by company.
// Business Unit filtering must be done manually in services if needed.
SupplierSchema.plugin(contextScopePlugin, {
    companyField: 'company'
});
