import type { Document, Model } from "mongoose";
import type { ISharedBranding, ISharedSecurityHardening, ISharedCompliance, ISharedSSOHub, ISharedWebhookOrchestrator, ISharedIntegrationRegistry, ISharedResourceQuota, ISharedRoleBlueprint, ISharedLegalGovernance, ISharedCommercialSaaS, ISharedInternationalizationHub, ISharedMaintenancePolicy, ISharedAPIDeveloperRegistry } from "../../organization/shared/common.interface.js";

export interface IPlatformSettings {
    branding: ISharedBranding;
    securityHardening: ISharedSecurityHardening;
    compliance: ISharedCompliance; // Added shared compliance
    internationalizationHub: ISharedInternationalizationHub;
    maintenance: ISharedMaintenancePolicy;
    legal: ISharedLegalGovernance;
    commercialSaaS: ISharedCommercialSaaS;
    ssoHub: ISharedSSOHub;
    webhookOrchestrator: ISharedWebhookOrchestrator;
    apiDeveloperRegistry: ISharedAPIDeveloperRegistry;
    integrationRegistry: ISharedIntegrationRegistry[];
    resourceQuotaBlueprint: ISharedResourceQuota;
    roleBlueprints: ISharedRoleBlueprint[];
}

export interface IPlatformSettingsDocument extends IPlatformSettings, Document {
    createdAt: Date;
    updatedAt: Date;
}

export interface IPlatformSettingsModel extends Model<IPlatformSettingsDocument> {
    getSettings(session?: any): Promise<IPlatformSettingsDocument>;
}
