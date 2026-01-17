import { Document, Model, Types } from 'mongoose';
import type { ISharedBranding, ISharedContact, ISharedLocation } from '../shared/common.interface.js';

export interface IOutlet extends Document {
    // Shared Structures
    branding: ISharedBranding;
    name: string;
    contact: ISharedContact;
    location: ISharedLocation;

    code: string;



    activeModules?: {
        pos: boolean;
        erp: boolean;
        hrm: boolean;
        ecommerce: boolean;
        crm: boolean;
        logistics: boolean;
    };

    organization: Types.ObjectId;
    businessUnit: Types.ObjectId;
    manager?: {
        name: string;
        phone: string;
        email: string;
        userId?: Types.ObjectId;
    };

    isActive: boolean;

    updatedAt: Date;

    // Virtuals
    settings?: any; // To be typed as IOutletSettings in higher context
}


export interface IOutletModel extends Model<IOutlet> {
    isCodeTaken(code: string, businessUnitId: string, session?: any): Promise<boolean>;
}
