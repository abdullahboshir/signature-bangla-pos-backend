import { Schema, model } from "mongoose";
import type { IPlatformSettingsDocument, IPlatformSettingsModel } from "./platform-settings.interface.js";
import { brandingSchema, securityHardeningSchema, complianceSchema, ssoHubSchema, webhookOrchestratorSchema, integrationRegistrySchema, resourceQuotaSchema, roleBlueprintSchema, legalGovernanceSchema, commercialSaaSSchema, internationalizationHubSchema, maintenancePolicySchema, apiDeveloperRegistrySchema } from "../../organization/shared/common.schema.js";
import { DEFAULT_BRANDING, DEFAULT_SECURITY_HARDENING, DEFAULT_COMPLIANCE, DEFAULT_INTERNATIONALIZATION, DEFAULT_MAINTENANCE_POLICY, DEFAULT_LEGAL_GOVERNANCE, DEFAULT_COMMERCIAL_SAAS, DEFAULT_SSO_HUB, DEFAULT_WEBHOOK_ORCHESTRATOR, DEFAULT_API_DEVELOPER_REGISTRY, DEFAULT_RESOURCE_QUOTA } from "../../organization/shared/common.defaults.js";

const platformSettingsSchema = new Schema<IPlatformSettingsDocument, IPlatformSettingsModel>({
    branding: { type: brandingSchema, required: true },
    securityHardening: { type: securityHardeningSchema, required: true },
    compliance: { type: complianceSchema, required: true },
    internationalizationHub: { type: internationalizationHubSchema, required: true },
    maintenance: { type: maintenancePolicySchema, required: true },
    legal: { type: legalGovernanceSchema, required: true },
    commercialSaaS: { type: commercialSaaSSchema, required: true },
    ssoHub: { type: ssoHubSchema },
    webhookOrchestrator: { type: webhookOrchestratorSchema },
    apiDeveloperRegistry: { type: apiDeveloperRegistrySchema, required: true },
    integrationRegistry: [{ type: integrationRegistrySchema }],
    resourceQuotaBlueprint: { type: resourceQuotaSchema },
    roleBlueprints: [{ type: roleBlueprintSchema }]
}, {
    timestamps: true
});

platformSettingsSchema.statics['getSettings'] = async function (session?: any) {
    let settings = await this.findOne().session(session || null);
    if (!settings) {
        const created = await this.create([{
            branding: DEFAULT_BRANDING,
            securityHardening: DEFAULT_SECURITY_HARDENING,
            compliance: DEFAULT_COMPLIANCE,
            internationalizationHub: DEFAULT_INTERNATIONALIZATION,
            maintenance: DEFAULT_MAINTENANCE_POLICY,
            legal: DEFAULT_LEGAL_GOVERNANCE,
            commercialSaaS: DEFAULT_COMMERCIAL_SAAS,
            ssoHub: DEFAULT_SSO_HUB,
            webhookOrchestrator: DEFAULT_WEBHOOK_ORCHESTRATOR,
            apiDeveloperRegistry: DEFAULT_API_DEVELOPER_REGISTRY,
            integrationRegistry: [],
            resourceQuotaBlueprint: DEFAULT_RESOURCE_QUOTA,
            roleBlueprints: []
        }], { session: session || null });
        return created[0] as IPlatformSettingsDocument;
    }
    return settings as IPlatformSettingsDocument;
};

export const PlatformSettings = model<IPlatformSettingsDocument, IPlatformSettingsModel>('PlatformSettings', platformSettingsSchema);
