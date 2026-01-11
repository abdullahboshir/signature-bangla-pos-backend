import type { Document, Model, Types } from "mongoose";
import type { ISharedPaymentSettings, ISharedOperatingHours, ISharedInventoryPolicy, ISharedPOSHardware, ISharedCommunicationChannel, ISharedPricingPolicy, ISharedFulfillmentPolicy, ISharedRewardPointsPolicy, ISharedWorkflowPolicy, ISharedTemplateRegistry, ISharedDisplayPolicy, ISharedCheckoutPolicy, ISharedShippingPolicy, ISharedSEOPolicy, ISharedHRMPolicy, ISharedPrefixPolicy, ISharedMaintenancePolicy, ISharedBranding, ISharedCompliance, ISharedInternationalizationHub, ISharedSecurityHardening, ISharedTaxIntelligence, ISharedIntegrationRegistry, ISharedLegalGovernance, ISharedSmtpConfig, ISharedSSOHub, ISharedWebhookOrchestrator, ISharedAPIDeveloperRegistry, ISharedContact } from "../../shared/common.interface.js";

export interface IBusinessUnitSettings {
  businessUnit: Types.ObjectId;

  // Tier-1: Core Configurations (Shared)
  branding: ISharedBranding;
  compliance: ISharedCompliance;
  internationalizationHub: ISharedInternationalizationHub;
  display: ISharedDisplayPolicy;
  checkout: ISharedCheckoutPolicy;
  shipping: ISharedShippingPolicy;
  taxIntelligence: ISharedTaxIntelligence;
  payment: ISharedPaymentSettings;
  legal?: ISharedLegalGovernance;
  smtp?: ISharedSmtpConfig;
  ssoHub?: ISharedSSOHub;
  webhookOrchestrator?: ISharedWebhookOrchestrator;
  apiDeveloperRegistry?: ISharedAPIDeveloperRegistry;
  contact?: ISharedContact;

  // Tier-2: operational Policies (Shared)
  pos: ISharedPOSHardware;
  inventory: ISharedInventoryPolicy;
  rewardPoints: ISharedRewardPointsPolicy;
  hrm: ISharedHRMPolicy;
  operatingHours: ISharedOperatingHours;

  // Tier-3: Strategic Governance (Shared)
  pricingPolicy: ISharedPricingPolicy;
  fulfillmentPolicy: ISharedFulfillmentPolicy;
  workflow: ISharedWorkflowPolicy;
  templates: ISharedTemplateRegistry;
  // Merged into securityHardening
  communication: ISharedCommunicationChannel;
  seo: ISharedSEOPolicy;
  prefixes: ISharedPrefixPolicy;
  securityHardening: ISharedSecurityHardening;
  maintenance: ISharedMaintenancePolicy;
  integrations: ISharedIntegrationRegistry[];

  createdAt: Date;
  updatedAt: Date;
}


export type IBusinessUnitSettingsDocument = IBusinessUnitSettings & Document & {
  enableMaintenanceMode(message?: string): Promise<void>;
  disableMaintenanceMode(): Promise<void>;
  isInMaintenance(): boolean;
  calculateShipping(weight: number, price: number, destination: string): number;
  validatePaymentMethod(method: string): boolean;
  getTaxRate(country: string, state?: string): number;
};

export interface IBusinessUnitSettingsModel extends Model<IBusinessUnitSettingsDocument> {
  getSettings(businessUnitId: string, session?: any): Promise<IBusinessUnitSettingsDocument>;
  getDefaultSettings(): Partial<IBusinessUnitSettings>;
}