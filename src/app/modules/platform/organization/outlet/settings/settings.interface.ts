import { Document, Model } from 'mongoose';
import type { IOutlet } from '../outlet.interface.js';
import type { ISharedOperatingHours, ISharedPaymentSettings, ISharedPOSHardware, ISharedCompliance, ISharedDisplayPolicy, ISharedCheckoutPolicy, ISharedServiceArea, ISharedCashierRegistry, ISharedBranding, ISharedInventoryPolicy, ISharedPricingPolicy, ISharedFulfillmentPolicy, ISharedCommunicationChannel, ISharedSEOPolicy, ISharedIntegrationRegistry, ISharedLegalGovernance, ISharedSmtpConfig, ISharedPrefixPolicy } from '../../shared/common.interface.js';

/**
 * Outlet-specific configuration.
 * Overrides Company Settings where applicable (e.g. receipt footer).
 */
export interface IOutletSettings extends Document {
    outlet: IOutlet['_id'];
    branding: ISharedBranding;
    pos: ISharedPOSHardware;
    compliance: ISharedCompliance;
    operatingHours: ISharedOperatingHours;
    display?: ISharedDisplayPolicy;
    checkout?: ISharedCheckoutPolicy;
    payment: ISharedPaymentSettings;
    serviceArea: ISharedServiceArea;
    cashier: ISharedCashierRegistry;
    inventory?: ISharedInventoryPolicy;
    pricingPolicy?: ISharedPricingPolicy;
    fulfillmentPolicy?: ISharedFulfillmentPolicy;
    communication?: ISharedCommunicationChannel;
    seo?: ISharedSEOPolicy;
    integrations?: ISharedIntegrationRegistry[];
    legal?: ISharedLegalGovernance;
    smtp?: ISharedSmtpConfig;
    prefixes?: ISharedPrefixPolicy;
}



export interface IOutletSettingsModel extends Model<IOutletSettings> {
    getSettings(outletId: string, session?: any): Promise<IOutletSettings>;
}
