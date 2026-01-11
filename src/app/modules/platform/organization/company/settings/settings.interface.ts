import { Document, Model } from 'mongoose';
import type { ICompanyDocument } from '../company.interface.ts';
import type { ISharedBranding, ISharedFiscalPeriod, ISharedReportingConfig, ISharedPrefixPolicy, ISharedDataArchivalPolicy, ISharedBackupRegistry, ISharedResourceQuota, ISharedFinancialCore, ISharedDocumentGovernance, ISharedGovernancePolicy, ISharedCorporateRegistry, ISharedCompliance, ISharedLegalGovernance, ISharedSSOHub, ISharedSecurityHardening, ISharedInternationalizationHub, ISharedPricingPolicy, ISharedFulfillmentPolicy, ISharedTaxIntelligence } from '../../shared/common.interface.js';

/**
 * Company-specific configuration.
 * Separated from Global System Settings to allow multi-tenant customization.
 */
export interface ICompanySettings extends Document {
    company: ICompanyDocument['_id']; // Reference to the company
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



export interface ICompanySettingsModel extends Model<ICompanySettings> {
    getSettings(companyId: string, session?: any): Promise<ICompanySettings>;
}
