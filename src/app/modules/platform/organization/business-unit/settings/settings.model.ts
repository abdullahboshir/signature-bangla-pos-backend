import { Schema, model } from "mongoose";
import type { IBusinessUnitSettingsDocument, IBusinessUnitSettingsModel } from "./settings.interface.js";
import { paymentSettingsSchema, operatingHoursSchema, inventoryPolicySchema, posHardwareSchema, communicationChannelSchema, pricingPolicySchema, fulfillmentPolicySchema, rewardPointsPolicySchema, workflowPolicySchema, templateRegistrySchema, displayPolicySchema, checkoutPolicySchema, shippingPolicySchema, seoPolicySchema, hrmPolicySchema, prefixPolicySchema, brandingSchema, complianceSchema, internationalizationHubSchema, securityHardeningSchema, taxIntelligenceSchema, integrationRegistrySchema, legalGovernanceSchema, smtpConfigSchema, maintenancePolicySchema, ssoHubSchema, webhookOrchestratorSchema, apiDeveloperRegistrySchema, contactSchema } from "../../shared/common.schema.js";
import {
  DEFAULT_BRANDING, DEFAULT_COMPLIANCE, DEFAULT_INTERNATIONALIZATION,
  DEFAULT_SECURITY_HARDENING, DEFAULT_TAX_INTELLIGENCE, DEFAULT_DISPLAY_POLICY,
  DEFAULT_CHECKOUT_POLICY, DEFAULT_SHIPPING_POLICY, DEFAULT_PAYMENT_SETTINGS,
  DEFAULT_MAINTENANCE_POLICY, DEFAULT_SEO_POLICY, DEFAULT_PREFIX_POLICY,
  DEFAULT_OPERATING_HOURS, DEFAULT_POS_HARDWARE, DEFAULT_INVENTORY_POLICY,
  DEFAULT_REWARD_POINTS_POLICY, DEFAULT_HRM_POLICY, DEFAULT_PRICING_POLICY,
  DEFAULT_FULFILLMENT_POLICY, DEFAULT_WORKFLOW_POLICY, DEFAULT_TEMPLATE_REGISTRY,
  DEFAULT_COMMUNICATION_CHANNEL, DEFAULT_LEGAL_GOVERNANCE, DEFAULT_SMTP_CONFIG,
  DEFAULT_SSO_HUB, DEFAULT_WEBHOOK_ORCHESTRATOR, DEFAULT_API_DEVELOPER_REGISTRY
} from "../../shared/common.defaults.js";

const businessUnitSettingsSchema = new Schema<IBusinessUnitSettingsDocument, IBusinessUnitSettingsModel>({
  businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true, unique: true },
  branding: { type: brandingSchema, default: DEFAULT_BRANDING },
  compliance: { type: complianceSchema, default: DEFAULT_COMPLIANCE },
  internationalizationHub: { type: internationalizationHubSchema, default: DEFAULT_INTERNATIONALIZATION },
  securityHardening: { type: securityHardeningSchema, default: DEFAULT_SECURITY_HARDENING },
  taxIntelligence: { type: taxIntelligenceSchema, default: DEFAULT_TAX_INTELLIGENCE },

  display: { type: displayPolicySchema, default: DEFAULT_DISPLAY_POLICY },
  checkout: { type: checkoutPolicySchema, default: DEFAULT_CHECKOUT_POLICY },
  shipping: { type: shippingPolicySchema, default: DEFAULT_SHIPPING_POLICY },
  payment: { type: paymentSettingsSchema, default: DEFAULT_PAYMENT_SETTINGS },
  maintenance: { type: maintenancePolicySchema, default: DEFAULT_MAINTENANCE_POLICY },
  seo: { type: seoPolicySchema, default: DEFAULT_SEO_POLICY },
  prefixes: { type: prefixPolicySchema, default: DEFAULT_PREFIX_POLICY },

  operatingHours: { type: operatingHoursSchema, default: DEFAULT_OPERATING_HOURS },
  pos: { type: posHardwareSchema, default: DEFAULT_POS_HARDWARE },
  inventory: { type: inventoryPolicySchema, default: DEFAULT_INVENTORY_POLICY },
  rewardPoints: { type: rewardPointsPolicySchema, default: DEFAULT_REWARD_POINTS_POLICY },
  hrm: { type: hrmPolicySchema, default: DEFAULT_HRM_POLICY },

  pricingPolicy: { type: pricingPolicySchema, default: DEFAULT_PRICING_POLICY },
  fulfillmentPolicy: { type: fulfillmentPolicySchema, default: DEFAULT_FULFILLMENT_POLICY },
  workflow: { type: workflowPolicySchema, default: DEFAULT_WORKFLOW_POLICY },

  templates: { type: templateRegistrySchema, default: DEFAULT_TEMPLATE_REGISTRY },
  communication: { type: communicationChannelSchema, default: DEFAULT_COMMUNICATION_CHANNEL },

  integrations: [{ type: integrationRegistrySchema }], // No default or empty array

  legal: { type: legalGovernanceSchema, default: DEFAULT_LEGAL_GOVERNANCE },
  smtp: { type: smtpConfigSchema, default: DEFAULT_SMTP_CONFIG },
  ssoHub: { type: ssoHubSchema, default: DEFAULT_SSO_HUB },
  webhookOrchestrator: { type: webhookOrchestratorSchema, default: DEFAULT_WEBHOOK_ORCHESTRATOR },
  apiDeveloperRegistry: { type: apiDeveloperRegistrySchema, default: DEFAULT_API_DEVELOPER_REGISTRY },
  contact: { type: contactSchema, default: { email: "bu@example.com", socialMedia: {} } }
}, {
  timestamps: true
});

// Static Methods
businessUnitSettingsSchema.statics['getSettings'] = async function (businessUnitId: string, session?: any) {
  let settings = await this.findOne({ businessUnit: businessUnitId }).session(session || null);
  if (!settings) {
    const created = await this.create([{
      businessUnit: businessUnitId,
      branding: DEFAULT_BRANDING,
      compliance: DEFAULT_COMPLIANCE,
      internationalizationHub: DEFAULT_INTERNATIONALIZATION,
      securityHardening: DEFAULT_SECURITY_HARDENING,
      taxIntelligence: DEFAULT_TAX_INTELLIGENCE,
      display: DEFAULT_DISPLAY_POLICY,
      checkout: DEFAULT_CHECKOUT_POLICY,
      shipping: DEFAULT_SHIPPING_POLICY,
      payment: DEFAULT_PAYMENT_SETTINGS,
      maintenance: DEFAULT_MAINTENANCE_POLICY,
      seo: DEFAULT_SEO_POLICY,
      prefixes: DEFAULT_PREFIX_POLICY,
      operatingHours: DEFAULT_OPERATING_HOURS,
      pos: DEFAULT_POS_HARDWARE,
      inventory: DEFAULT_INVENTORY_POLICY,
      rewardPoints: DEFAULT_REWARD_POINTS_POLICY,
      hrm: DEFAULT_HRM_POLICY,
      pricingPolicy: DEFAULT_PRICING_POLICY,
      fulfillmentPolicy: DEFAULT_FULFILLMENT_POLICY,
      workflow: DEFAULT_WORKFLOW_POLICY,
      templates: DEFAULT_TEMPLATE_REGISTRY,
      communication: DEFAULT_COMMUNICATION_CHANNEL,
      integrations: [],
      legal: DEFAULT_LEGAL_GOVERNANCE,
      smtp: DEFAULT_SMTP_CONFIG,
      ssoHub: DEFAULT_SSO_HUB,
      webhookOrchestrator: DEFAULT_WEBHOOK_ORCHESTRATOR,
      apiDeveloperRegistry: DEFAULT_API_DEVELOPER_REGISTRY,
      contact: { email: "bu@example.com", socialMedia: {} }
    }], { session: session || null });
    return created[0];
  }
  return settings;
};

businessUnitSettingsSchema.statics['getDefaultSettings'] = function (): Partial<IBusinessUnitSettingsDocument> {
  return {
    branding: DEFAULT_BRANDING,
    compliance: DEFAULT_COMPLIANCE,
    internationalizationHub: DEFAULT_INTERNATIONALIZATION,
    securityHardening: DEFAULT_SECURITY_HARDENING,
    taxIntelligence: DEFAULT_TAX_INTELLIGENCE,
    display: DEFAULT_DISPLAY_POLICY,
    checkout: DEFAULT_CHECKOUT_POLICY,
    shipping: DEFAULT_SHIPPING_POLICY,
    payment: DEFAULT_PAYMENT_SETTINGS,
    maintenance: DEFAULT_MAINTENANCE_POLICY,
    seo: DEFAULT_SEO_POLICY,
    prefixes: DEFAULT_PREFIX_POLICY,
    operatingHours: DEFAULT_OPERATING_HOURS,
    pos: DEFAULT_POS_HARDWARE,
    inventory: DEFAULT_INVENTORY_POLICY,
    rewardPoints: DEFAULT_REWARD_POINTS_POLICY,
    hrm: DEFAULT_HRM_POLICY,
    pricingPolicy: DEFAULT_PRICING_POLICY,
    fulfillmentPolicy: DEFAULT_FULFILLMENT_POLICY,
    workflow: DEFAULT_WORKFLOW_POLICY,
    templates: DEFAULT_TEMPLATE_REGISTRY,
    communication: DEFAULT_COMMUNICATION_CHANNEL,
    integrations: [],
    legal: DEFAULT_LEGAL_GOVERNANCE,
    smtp: DEFAULT_SMTP_CONFIG,
    ssoHub: DEFAULT_SSO_HUB,
    webhookOrchestrator: DEFAULT_WEBHOOK_ORCHESTRATOR,
    apiDeveloperRegistry: DEFAULT_API_DEVELOPER_REGISTRY,
    contact: { email: "bu@example.com", socialMedia: {} }
  };
};

export const BusinessUnitSettings = model<IBusinessUnitSettingsDocument, IBusinessUnitSettingsModel>('BusinessUnitSettings', businessUnitSettingsSchema);