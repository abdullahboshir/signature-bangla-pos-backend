import { Schema, model } from "mongoose";
import { contextScopePlugin } from '@core/plugins/context-scope.plugin.js';

export interface IAssetCategory {
    name: string;
    code: string;
    description?: string;
    // Module: Where is this asset used? 
    // e.g. 'pos' (Cash Drawer, POS Terminal), 'erp' (Heavy Machinery), 'logistics' (Trucks)
    module: 'pos' | 'erp' | 'hrm' | 'ecommerce' | 'crm' | 'logistics' | 'system';
    depreciationRate?: number; // Yearly %
    isActive: boolean;
    businessUnit: Schema.Types.ObjectId;
}

const assetCategorySchema = new Schema<IAssetCategory>({
    name: { type: String, required: true },
    code: { type: String, required: true, uppercase: true },
    description: { type: String },
    module: {
        type: String,
        enum: ['pos', 'erp', 'hrm', 'ecommerce', 'crm', 'logistics', 'system'],
        default: 'erp', // Default to ERP as it's usually finance related
        required: true,
        index: true
    },
    depreciationRate: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true }
}, {
    timestamps: true
});

assetCategorySchema.index({ code: 1, businessUnit: 1 }, { unique: true });
assetCategorySchema.index({ module: 1 });

// Apply Context-Aware Data Isolation
assetCategorySchema.plugin(contextScopePlugin, {
    businessUnitField: 'businessUnit'
});

export const AssetCategory = model<IAssetCategory>('AssetCategory', assetCategorySchema);
