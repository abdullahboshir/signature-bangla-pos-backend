import { Model, Types } from 'mongoose';

export type ILicenseStatus = 'active' | 'expired' | 'revoked';

export interface ILicense {
    clientId: Types.ObjectId; // BusinessUnit ID or User ID
    clientName?: string; // Cache for display
    packageId: Types.ObjectId;
    key: string;
    expiresAt?: Date; // Null for lifetime
    status: ILicenseStatus;
    activationDate: Date;
    createdBy: Types.ObjectId; // Admin who created it
}

export type LicenseModel = Model<ILicense>;
