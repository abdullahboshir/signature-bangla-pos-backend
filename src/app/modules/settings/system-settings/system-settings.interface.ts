import { Model, Document } from "mongoose";

export interface ISystemSettings {
    softDeleteRetentionDays: number;
    isRetentionPolicyEnabled: boolean;
}

export interface ISystemSettingsDocument extends ISystemSettings, Document {
    createdAt: Date;
    updatedAt: Date;
}

export interface ISystemSettingsModel extends Model<ISystemSettingsDocument> {
    getSettings(): Promise<ISystemSettingsDocument>;
}
