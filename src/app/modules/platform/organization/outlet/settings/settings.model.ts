import { Schema, model } from 'mongoose';
import type { IOutletSettings, IOutletSettingsModel } from './settings.interface.js';
import { operatingHoursSchema, paymentSettingsSchema, posHardwareSchema, complianceSchema, displayPolicySchema, checkoutPolicySchema, serviceAreaSchema, cashierRegistrySchema, brandingSchema, inventoryPolicySchema, pricingPolicySchema, fulfillmentPolicySchema, seoPolicySchema, integrationRegistrySchema, legalGovernanceSchema, smtpConfigSchema, prefixPolicySchema, taxIntelligenceSchema, contactSchema, communicationChannelSchema } from '../../shared/common.schema.js';
import {
    DEFAULT_BRANDING, DEFAULT_POS_HARDWARE, DEFAULT_COMPLIANCE,
    DEFAULT_OPERATING_HOURS, DEFAULT_PAYMENT_SETTINGS, DEFAULT_SERVICE_AREA,
    DEFAULT_CASHIER_REGISTRY, DEFAULT_LEGAL_GOVERNANCE, DEFAULT_SMTP_CONFIG,
    DEFAULT_PREFIX_POLICY, DEFAULT_TAX_INTELLIGENCE, DEFAULT_DISPLAY_POLICY,
    DEFAULT_CHECKOUT_POLICY, DEFAULT_INVENTORY_POLICY, DEFAULT_PRICING_POLICY,
    DEFAULT_FULFILLMENT_POLICY, DEFAULT_COMMUNICATION_CHANNEL, DEFAULT_SEO_POLICY
} from '../../shared/common.defaults.js';

const outletSettingsSchema = new Schema<IOutletSettings>({
    outlet: {
        type: Schema.Types.ObjectId,
        ref: 'Outlet',
        required: true,
        unique: true
    },
    branding: { type: brandingSchema, default: DEFAULT_BRANDING },
    pos: { type: posHardwareSchema, default: DEFAULT_POS_HARDWARE },
    compliance: { type: complianceSchema, default: DEFAULT_COMPLIANCE },
    operatingHours: { type: operatingHoursSchema, default: DEFAULT_OPERATING_HOURS },
    payment: { type: paymentSettingsSchema, default: DEFAULT_PAYMENT_SETTINGS },
    serviceArea: { type: serviceAreaSchema, default: DEFAULT_SERVICE_AREA },
    cashier: { type: cashierRegistrySchema, default: DEFAULT_CASHIER_REGISTRY },
    integrations: { type: [integrationRegistrySchema], default: [] },
    legal: { type: legalGovernanceSchema, default: DEFAULT_LEGAL_GOVERNANCE },
    smtp: { type: smtpConfigSchema, default: DEFAULT_SMTP_CONFIG },
    prefixes: { type: prefixPolicySchema, default: DEFAULT_PREFIX_POLICY },
    taxIntelligence: { type: taxIntelligenceSchema, default: DEFAULT_TAX_INTELLIGENCE },
    contact: { type: contactSchema, default: { email: "outlet@example.com", socialMedia: {} } },
    display: { type: displayPolicySchema, default: DEFAULT_DISPLAY_POLICY },
    checkout: { type: checkoutPolicySchema, default: DEFAULT_CHECKOUT_POLICY },
    inventory: { type: inventoryPolicySchema, default: DEFAULT_INVENTORY_POLICY },
    pricingPolicy: { type: pricingPolicySchema, default: DEFAULT_PRICING_POLICY },
    fulfillmentPolicy: { type: fulfillmentPolicySchema, default: DEFAULT_FULFILLMENT_POLICY },
    communication: { type: communicationChannelSchema, default: DEFAULT_COMMUNICATION_CHANNEL },
    seo: { type: seoPolicySchema, default: DEFAULT_SEO_POLICY }
}, {
    timestamps: true
});

outletSettingsSchema.statics['getSettings'] = async function (outletId: string, session?: any) {
    let settings = await this.findOne({ outlet: outletId }).session(session || null);
    if (!settings) {
        const created = await this.create([{
            outlet: outletId,
            branding: DEFAULT_BRANDING,
            pos: DEFAULT_POS_HARDWARE,
            compliance: DEFAULT_COMPLIANCE,
            operatingHours: DEFAULT_OPERATING_HOURS,
            payment: DEFAULT_PAYMENT_SETTINGS,
            serviceArea: DEFAULT_SERVICE_AREA,
            cashier: DEFAULT_CASHIER_REGISTRY,
            integrations: [],
            legal: DEFAULT_LEGAL_GOVERNANCE,
            smtp: DEFAULT_SMTP_CONFIG,
            prefixes: DEFAULT_PREFIX_POLICY,
            taxIntelligence: DEFAULT_TAX_INTELLIGENCE,
            contact: { email: "outlet@example.com", socialMedia: {} },
            display: DEFAULT_DISPLAY_POLICY,
            checkout: DEFAULT_CHECKOUT_POLICY,
            inventory: DEFAULT_INVENTORY_POLICY,
            pricingPolicy: DEFAULT_PRICING_POLICY,
            fulfillmentPolicy: DEFAULT_FULFILLMENT_POLICY,
            communication: DEFAULT_COMMUNICATION_CHANNEL,
            seo: DEFAULT_SEO_POLICY
        }], { session: session || null });
        return created[0];
    }
    return settings;
};

export const OutletSettings = model<IOutletSettings, IOutletSettingsModel>('OutletSettings', outletSettingsSchema);
