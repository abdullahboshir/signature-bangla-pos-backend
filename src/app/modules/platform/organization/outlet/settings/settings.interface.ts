import { Document, Model } from 'mongoose';
import type { IOutlet } from '../outlet.interface.ts';

/**
 * Outlet-specific configuration.
 * Overrides Company Settings where applicable (e.g. receipt footer).
 */
export interface IOutletSettings extends Document {
    outlet: IOutlet['_id'];
    pos: {
        counterName: string;
        isTableManagementEnabled: boolean;
        receiptPrinterIp?: string;
    };
    operatingHours: {
        open: string; // "09:00"
        close: string; // "22:00"
    };
}

export type IOutletSettingsModel = Model<IOutletSettings>;
