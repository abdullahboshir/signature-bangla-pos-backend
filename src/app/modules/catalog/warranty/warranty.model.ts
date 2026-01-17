import { Schema, model } from "mongoose";
import type { IWarrantyDocument } from "./warranty.interface.ts";
import { contextScopePlugin } from "@core/plugins/context-scope.plugin.ts";

const warrantySchema = new Schema<IWarrantyDocument>({
  name: { type: String, required: true, trim: true },
  duration: { type: Number, required: true, min: 0 },
  periodUnit: { 
    type: String, 
    required: true, 
    enum: ["days", "weeks", "months", "years"],
    default: "months" 
  },
  type: { 
    type: String, 
    required: true, 
    enum: ["seller", "manufacturer", "brand"],
    default: "seller" 
  },
  description: { type: String, trim: true },
  termsConditions: { type: String, trim: true },
  availableModules: [{ type: String }],
  isActive: { type: Boolean, default: true },
  company: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit' }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (_doc, ret) {
      delete (ret as any).__v;
      return ret;
    }
  }
});

// Apply company scoping plugin
warrantySchema.plugin(contextScopePlugin, {
  companyField: 'company',
  businessUnitField: 'businessUnit'
});

export const Warranty = model<IWarrantyDocument>('Warranty', warrantySchema);
