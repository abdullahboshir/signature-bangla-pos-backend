import { Schema, model } from "mongoose";

export interface IComplianceDocument {
    title: string;
    description?: string;
    type: 'license' | 'deed' | 'policy' | 'certificate' | 'tax' | 'other';
    fileUrl: string; // S3 or Storage URL
    expiryDate?: Date;
    businessUnit: Schema.Types.ObjectId;
    uploadedBy: Schema.Types.ObjectId;
    status: 'active' | 'expired' | 'archived';
}

const complianceDocumentSchema = new Schema<IComplianceDocument>({
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['license', 'deed', 'policy', 'certificate', 'tax', 'other'], required: true },
    fileUrl: { type: String, required: true },
    expiryDate: { type: Date },
    businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['active', 'expired', 'archived'], default: 'active' }
}, {
    timestamps: true
});

export const ComplianceDocument = model<IComplianceDocument>('ComplianceDocument', complianceDocumentSchema);
