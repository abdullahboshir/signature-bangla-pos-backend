import { Schema, model } from 'mongoose';
import type { ICompanySettings, ICompanySettingsModel } from './settings.interface.js';
import { brandingSchema, complianceSchema, fiscalPeriodSchema, reportingConfigSchema, prefixPolicySchema, dataArchivalPolicySchema, backupRegistrySchema, resourceQuotaSchema, financialCoreSchema, documentGovernanceSchema, governancePolicySchema, corporateRegistrySchema, legalGovernanceSchema, ssoHubSchema, internationalizationHubSchema, pricingPolicySchema, fulfillmentPolicySchema, securityHardeningSchema, taxIntelligenceSchema, integrationRegistrySchema, storageRegistrySchema, smtpConfigSchema, webhookOrchestratorSchema, apiDeveloperRegistrySchema, contactSchema } from '../../shared/common.schema.js';
import {
    DEFAULT_BRANDING, DEFAULT_GOVERNANCE_POLICY, DEFAULT_PREFIX_POLICY,
    DEFAULT_CORPORATE_REGISTRY, DEFAULT_FINANCIAL_CORE, DEFAULT_DOCUMENT_GOVERNANCE,
    DEFAULT_REPORTING_CONFIG, DEFAULT_SECURITY_HARDENING, DEFAULT_INTERNATIONALIZATION,
    DEFAULT_LEGAL_GOVERNANCE, DEFAULT_SSO_HUB, DEFAULT_ARCHIVAL_POLICY,
    DEFAULT_BACKUP_REGISTRY, DEFAULT_COMPLIANCE, DEFAULT_RESOURCE_QUOTA,
    DEFAULT_TAX_INTELLIGENCE, DEFAULT_PRICING_POLICY, DEFAULT_FULFILLMENT_POLICY,
    DEFAULT_STORAGE_REGISTRY, DEFAULT_SMTP_CONFIG, DEFAULT_WEBHOOK_ORCHESTRATOR,
    DEFAULT_API_DEVELOPER_REGISTRY
} from '../../shared/common.defaults.js';


const companySettingsSchema = new Schema<ICompanySettings, ICompanySettingsModel>({
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, unique: true },
    branding: { type: brandingSchema, required: true },
    governance: { type: governancePolicySchema, required: true },
    prefixes: { type: prefixPolicySchema, required: true },
    corporateRegistry: { type: corporateRegistrySchema, required: true },
    financialCore: { type: financialCoreSchema, required: true },
    documentGovernance: { type: documentGovernanceSchema, required: true },
    reporting: { type: reportingConfigSchema, required: true },
    securityHardening: { type: securityHardeningSchema, required: true },
    internationalizationHub: { type: internationalizationHubSchema, required: true },
    legal: { type: legalGovernanceSchema },
    ssoHub: { type: ssoHubSchema },
    fiscalPeriods: { type: [fiscalPeriodSchema], default: [] },
    archivalPolicy: { type: dataArchivalPolicySchema, required: true },
    backupRegistry: { type: backupRegistrySchema, required: true },
    compliance: { type: complianceSchema, required: true },
    resourceQuotaEnforcement: { type: resourceQuotaSchema },
    taxIntelligence: { type: taxIntelligenceSchema },
    pricingPolicy: { type: pricingPolicySchema },
    fulfillmentPolicy: { type: fulfillmentPolicySchema },
    integrations: { type: [integrationRegistrySchema], default: [] },
    storageRegistry: { type: storageRegistrySchema },
    smtp: { type: smtpConfigSchema },
    webhookOrchestrator: { type: webhookOrchestratorSchema },
    apiDeveloperRegistry: { type: apiDeveloperRegistrySchema },
    contact: { type: contactSchema }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (_doc, ret: any) {
            delete ret._id;
            delete ret.__v;
        }
    }
});

// Static method to get or create settings for a specific company
companySettingsSchema.statics['getSettings'] = async function (companyId: string, session?: any) {
    let settings = await this.findOne({ company: companyId }).session(session || null);
    if (!settings) {
        let created = await this.create([{
            company: companyId,
            branding: DEFAULT_BRANDING,
            governance: DEFAULT_GOVERNANCE_POLICY,
            prefixes: DEFAULT_PREFIX_POLICY,
            securityHardening: DEFAULT_SECURITY_HARDENING,
            internationalizationHub: DEFAULT_INTERNATIONALIZATION,
            corporateRegistry: DEFAULT_CORPORATE_REGISTRY,
            financialCore: DEFAULT_FINANCIAL_CORE,
            documentGovernance: DEFAULT_DOCUMENT_GOVERNANCE,
            reporting: DEFAULT_REPORTING_CONFIG,
            fiscalPeriods: [],
            archivalPolicy: DEFAULT_ARCHIVAL_POLICY,
            backupRegistry: DEFAULT_BACKUP_REGISTRY,
            resourceQuotaEnforcement: DEFAULT_RESOURCE_QUOTA,
            pricingPolicy: DEFAULT_PRICING_POLICY,
            fulfillmentPolicy: DEFAULT_FULFILLMENT_POLICY,
            taxIntelligence: DEFAULT_TAX_INTELLIGENCE,
            compliance: DEFAULT_COMPLIANCE,
            integrations: [],
            smtp: DEFAULT_SMTP_CONFIG,
            webhookOrchestrator: DEFAULT_WEBHOOK_ORCHESTRATOR,
            apiDeveloperRegistry: DEFAULT_API_DEVELOPER_REGISTRY,
            storageRegistry: { ...DEFAULT_STORAGE_REGISTRY, bucketName: 'tenant-storage' },
            contact: { email: "tenant@example.com", socialMedia: {} },
            legal: DEFAULT_LEGAL_GOVERNANCE,
            ssoHub: DEFAULT_SSO_HUB,
        }], { session: session || null });
        return created[0] as ICompanySettings;
    }
    return settings as ICompanySettings;
};

export const CompanySettings = model<ICompanySettings, ICompanySettingsModel>('CompanySettings', companySettingsSchema);
