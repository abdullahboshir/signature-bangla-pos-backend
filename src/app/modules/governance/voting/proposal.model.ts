import { Schema, model } from "mongoose";
import { contextScopePlugin } from "@core/plugins/context-scope.plugin.js";

export interface IProposal {
    title: string;
    description: string;
    type: 'resolution' | 'election' | 'policy' | 'other';
    options: {
        label: string; // "Yes", "No", "Abstain", or Candidate Name
        value: string;
    }[];
    startDate: Date;
    endDate: Date;
    status: 'draft' | 'active' | 'closed' | 'cancelled';
    businessUnit: Schema.Types.ObjectId;
    createdBy: Schema.Types.ObjectId; // User 
    votes: {
        shareholder: Schema.Types.ObjectId; // Shareholder ID (not User ID directly, to track equity weight)
        optionValue: string;
        timestamp: Date;
        comments?: string;
    }[];
    finalResult?: string; // Summary of result
    company: Schema.Types.ObjectId;
}

const proposalSchema = new Schema<IProposal>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['resolution', 'election', 'policy', 'other'], default: 'resolution' },
    options: [{
        label: { type: String, required: true },
        value: { type: String, required: true }
    }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['draft', 'active', 'closed', 'cancelled'], default: 'draft' },
    businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true, index: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    votes: [{
        shareholder: { type: Schema.Types.ObjectId, ref: 'Shareholder' },
        optionValue: { type: String },
        timestamp: { type: Date, default: Date.now },
        comments: { type: String }
    }],
    finalResult: { type: String }
}, {
    timestamps: true
});

export const Proposal = model<IProposal>('Proposal', proposalSchema);

// Apply Context-Aware Data Isolation
proposalSchema.plugin(contextScopePlugin, {
    companyField: 'company',
    businessUnitField: 'businessUnit'
});
