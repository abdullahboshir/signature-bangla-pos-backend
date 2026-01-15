import { Model, Types, Document } from "mongoose";

export interface IAttribute {
    name: string;
    values: string[];
    businessUnit: Types.ObjectId;
    company: Types.ObjectId;
    availableModules: ('pos' | 'erp' | 'hrm' | 'ecommerce' | 'crm' | 'logistics' | 'system')[];
    status: "active" | "inactive";
    createdBy: Types.ObjectId;
}

export type IAttributeDocument = IAttribute & Document;
export type IAttributeModel = Model<IAttributeDocument>;
