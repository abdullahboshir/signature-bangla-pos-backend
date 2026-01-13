import { Schema, model } from 'mongoose';
import { contextScopePlugin } from "@core/plugins/context-scope.plugin.js";

export interface IAdCampaign {
    name: string;
    platformId: string; // Meta Campaign ID
    objective?: string;
    status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'UNKNOWN';
    budget?: number;
    spend?: number;
    impressions?: number;
    clicks?: number;
    ctr?: number;
    startDate?: Date;
    endDate?: Date;
    metaData?: Record<string, any>; // Store raw Meta response if needed
    company: Schema.Types.ObjectId;
    businessUnit: Schema.Types.ObjectId;
}

const adCampaignSchema = new Schema<IAdCampaign>({
    name: { type: String, required: true },
    platformId: { type: String, required: true, unique: true }, // Ensure uniqueness for Meta ID
    objective: { type: String },
    status: {
        type: String,
        enum: ['ACTIVE', 'PAUSED', 'ARCHIVED', 'UNKNOWN'],
        default: 'UNKNOWN'
    },
    budget: { type: Number, default: 0 },
    spend: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    ctr: { type: Number, default: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true, index: true },
    metaData: { type: Map, of: Schema.Types.Mixed },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
});

adCampaignSchema.index({ businessUnit: 1, startDate: -1 });
adCampaignSchema.index({ status: 1 });
adCampaignSchema.index({ objective: 1 });

export const AdCampaign = model<IAdCampaign>('AdCampaign', adCampaignSchema);

// Apply Context-Aware Data Isolation
adCampaignSchema.plugin(contextScopePlugin, {
    companyField: 'company',
    businessUnitField: 'businessUnit'
});
