import { Schema, model } from "mongoose";
import { contextScopePlugin } from "@core/plugins/context-scope.plugin.js";

export interface IShareholder {
    user: Schema.Types.ObjectId;  // Reference to User (Platform or Business User)
    businessUnit?: Schema.Types.ObjectId; // Specific Unit (Subsidiary)
    company?: Schema.Types.ObjectId; // Global Company (Holding)
    outlet?: Schema.Types.ObjectId; // Specific Outlet (Branch)
    equityPercentage: number; // e.g. 25.5%
    numberOfShares: number; // e.g. 1000
    shareClass: 'A' | 'B' | 'Common' | 'Preferred';
    status: 'active' | 'inactive';
    notes?: string;
    investmentAmount?: number;
    joinedDate: Date;
}

const shareholderSchema = new Schema<IShareholder>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // A shareholder can be tied to a specific Business Unit, Outlet OR the Global Company
    businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit' },
    company: { type: Schema.Types.ObjectId, ref: 'Company' },
    outlet: { type: Schema.Types.ObjectId, ref: 'Outlet' },

    equityPercentage: { type: Number, required: true },
    numberOfShares: { type: Number, required: true },
    shareClass: {
        type: String,
        enum: ['A', 'B', 'Common', 'Preferred'],
        default: 'Common'
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    notes: { type: String },
    investmentAmount: { type: Number },
    joinedDate: { type: Date, default: Date.now },
}, {
    timestamps: true
});

// Validation: Must have at least one allowed scope
shareholderSchema.pre('validate', function (next) {
    if (!this.businessUnit && !this.company && !this.outlet) {
        next(new Error('Shareholder must be linked to a Company, Business Unit, or Outlet.'));
    } else {
        next();
    }
});

// A user can be a shareholder in a context only once
shareholderSchema.index({ user: 1, businessUnit: 1 }, { unique: true, sparse: true });
shareholderSchema.index({ user: 1, company: 1 }, { unique: true, sparse: true });
shareholderSchema.index({ user: 1, outlet: 1 }, { unique: true, sparse: true });

export const Shareholder = model<IShareholder>('Shareholder', shareholderSchema);

// Apply Context-Aware Data Isolation
shareholderSchema.plugin(contextScopePlugin, {
    companyField: 'company',
    businessUnitField: 'businessUnit',
    outletField: 'outlet'
});
