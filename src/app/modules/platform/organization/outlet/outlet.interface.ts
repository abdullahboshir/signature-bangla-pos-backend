import { Document, Model, Types } from "mongoose";

export interface IOutlet extends Document {
    name: string;
    code: string;
    address: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
    phone: string;
    email?: string;
    activeModules?: {
        pos: boolean;
        erp: boolean;
        hrm: boolean;
        ecommerce: boolean;
        crm: boolean;
        logistics: boolean;
    };
    businessUnit: Types.ObjectId;
    manager?: Types.ObjectId;

    isActive: boolean;

    createdAt: Date;
    updatedAt: Date;
}

export interface IOutletModel extends Model<IOutlet> {
    isCodeTaken(code: string, businessUnitId: string): Promise<boolean>;
}
