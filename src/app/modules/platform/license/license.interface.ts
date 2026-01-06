import { Model, Types } from 'mongoose';

export type ILicenseStatus = 'active' | 'expired' | 'revoked';

export interface ILicense {
    clientId: Types.ObjectId;
    clientName?: string; // Cache for display
    packageId: Types.ObjectId;
    key: string;
    expiresAt?: Date; // Null for lifetime
    customModules?: {
        pos?: boolean;
        erp?: boolean;
        hrm?: boolean;
        ecommerce?: boolean;
        crm?: boolean;
        logistics?: boolean;
    };
    status: ILicenseStatus;
    activationDate: Date;
    createdBy: Types.ObjectId; // Admin who created it
}

export type LicenseModel = Model<ILicense>;
