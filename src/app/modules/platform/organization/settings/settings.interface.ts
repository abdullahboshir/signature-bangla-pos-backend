import { Document, Model } from 'mongoose';
import type { IOrganizationDocument } from '../organization.interface.ts';
import type { ISharedBackupRegistry, ISharedBranding, ISharedCompliance, ISharedCorporateRegistry, ISharedDataArchivalPolicy, ISharedDocumentGovernance, ISharedFinancialCore, ISharedFiscalPeriod, ISharedFulfillmentPolicy, ISharedGovernancePolicy, ISharedInternationalizationHub, ISharedLegalGovernance, ISharedPrefixPolicy, ISharedPricingPolicy, ISharedReportingConfig, ISharedResourceQuota, ISharedSecurityHardening, ISharedSSOHub, ISharedTaxIntelligence } from '../shared/common.interface.ts';


/**
 * Organization-specific configuration.
 * Separated from Global System Settings to allow multi-tenant customization.
 */
export interface IOrganizationSettings extends Document {
    organization: IOrganizationDocument['_id']; 
    branding: ISharedBranding;
    compliance: ISharedCompliance;
    governance: ISharedGovernancePolicy;
    securityHardening: ISharedSecurityHardening;
    internationalizationHub: ISharedInternationalizationHub;
    legal: ISharedLegalGovernance;
    ssoHub: ISharedSSOHub;
    prefixes: ISharedPrefixPolicy;
    corporateRegistry: ISharedCorporateRegistry;
    financialCore: ISharedFinancialCore;
    documentGovernance: ISharedDocumentGovernance;
    reporting: ISharedReportingConfig;
    fiscalPeriods: ISharedFiscalPeriod[];
    archivalPolicy: ISharedDataArchivalPolicy;
    backupRegistry: ISharedBackupRegistry;
    resourceQuotaEnforcement: ISharedResourceQuota;
    taxIntelligence: ISharedTaxIntelligence;
    pricingPolicy: ISharedPricingPolicy;
    fulfillmentPolicy: ISharedFulfillmentPolicy;
}



export interface IOrganizationSettingsModel extends Model<IOrganizationSettings> {
    getSettings(organizationId: string, session?: any): Promise<IOrganizationSettings>;
}
