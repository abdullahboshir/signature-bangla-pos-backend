import { Schema, model } from "mongoose";
import type { ISystemSettingsDocument, ISystemSettingsModel } from "./system-settings.interface.js";
import { moduleMapSchema, systemCoreSchema, observabilitySchema, infrastructureHubSchema, storageRegistrySchema, gatewayGovernanceSchema, internationalizationHubSchema } from "../../organization/shared/common.schema.js";
import { DEFAULT_MODULE_MAP, DEFAULT_SMTP_CONFIG, DEFAULT_BACKUP_REGISTRY, DEFAULT_OBSERVABILITY, DEFAULT_STORAGE_REGISTRY, DEFAULT_GATEWAY_GOVERNANCE, DEFAULT_INTERNATIONALIZATION } from "../../organization/shared/common.defaults.js";

const systemSettingsSchema = new Schema<ISystemSettingsDocument, ISystemSettingsModel>({
    softDeleteRetentionDays: {
        type: Number,
        default: 30,
        min: 1
    },
    isRetentionPolicyEnabled: {
        type: Boolean,
        default: true
    },
    licenseKey: {
        type: String,
        default: null,
        select: false
    },
    enabledModules: { type: moduleMapSchema, required: true },
    core: { type: systemCoreSchema, required: true },
    observability: { type: observabilitySchema, required: true },
    infrastructureHub: { type: infrastructureHubSchema, required: true },
    storageRegistry: { type: storageRegistrySchema, required: true },
    gatewayGovernance: { type: gatewayGovernanceSchema, required: true },
    internationalizationHub: { type: internationalizationHubSchema, required: true }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Static method to get or create settings
systemSettingsSchema.statics['getSettings'] = async function (session?: any): Promise<ISystemSettingsDocument> {
    let settings = await this.findOne().session(session || null);
    if (!settings) {
        const created = await this.create([{
            softDeleteRetentionDays: 30,
            isRetentionPolicyEnabled: true,
            enabledModules: DEFAULT_MODULE_MAP,
            core: {
                storageDriver: 'local',
                maxStorageLimitGB: 10,
                smtp: DEFAULT_SMTP_CONFIG,
                backup: DEFAULT_BACKUP_REGISTRY
            },
            observability: DEFAULT_OBSERVABILITY,
            infrastructureHub: {
                enableLoadBalancer: false,
                lbType: "round-robin",
                clusterNodes: [],
                cacheLayer: { driver: "internal" }
            },
            storageRegistry: DEFAULT_STORAGE_REGISTRY,
            gatewayGovernance: DEFAULT_GATEWAY_GOVERNANCE,
            internationalizationHub: DEFAULT_INTERNATIONALIZATION
        }], { session: session || null });
        return created[0] as ISystemSettingsDocument;
    }
    return settings as ISystemSettingsDocument;
};

export const SystemSettings = model<ISystemSettingsDocument, ISystemSettingsModel>('SystemSettings', systemSettingsSchema);
