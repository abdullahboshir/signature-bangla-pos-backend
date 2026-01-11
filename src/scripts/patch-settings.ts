import mongoose from "mongoose";
import appConfig from "../shared/config/app.config.js";
import { PlatformSettings } from "../app/modules/platform/settings/platform-settings/platform-settings.model.js";
import { SystemSettings } from "../app/modules/platform/settings/system-settings/system-settings.model.js";
import {
    DEFAULT_BRANDING, DEFAULT_SECURITY_HARDENING, DEFAULT_COMPLIANCE,
    DEFAULT_INTERNATIONALIZATION, DEFAULT_MAINTENANCE_POLICY, DEFAULT_LEGAL_GOVERNANCE,
    DEFAULT_COMMERCIAL_SAAS, DEFAULT_SSO_HUB, DEFAULT_WEBHOOK_ORCHESTRATOR,
    DEFAULT_API_DEVELOPER_REGISTRY, DEFAULT_RESOURCE_QUOTA, DEFAULT_BACKUP_REGISTRY,
    DEFAULT_SMTP_CONFIG, DEFAULT_MODULE_MAP, DEFAULT_OBSERVABILITY,
    DEFAULT_STORAGE_REGISTRY, DEFAULT_GATEWAY_GOVERNANCE
} from "../app/modules/platform/organization/shared/common.defaults.js";
import "colors";

const patchSettings = async () => {
    try {
        console.log("Connecting to DB...".yellow);
        await mongoose.connect(appConfig.db_url);
        console.log("✅ Connected to DB".green);

        // --- PLATFORM SETTINGS ---
        console.log("🛠️  Patching Platform Settings...".blue);
        let platform = await PlatformSettings.findOne();

        if (!platform) {
            console.log("   Platform Settings not found. Creating new...".magenta);
            platform = new PlatformSettings({});
        } else {
            console.log("   Platform Settings found. Updating missing fields...".cyan);
        }

        // Apply Defaults via simple check
        if (!platform.branding) platform.branding = DEFAULT_BRANDING;
        if (!platform.securityHardening) platform.securityHardening = DEFAULT_SECURITY_HARDENING;
        if (!platform.compliance) platform.compliance = DEFAULT_COMPLIANCE;
        if (!platform.internationalizationHub) platform.internationalizationHub = DEFAULT_INTERNATIONALIZATION;
        if (!platform.maintenance) platform.maintenance = DEFAULT_MAINTENANCE_POLICY;
        if (!platform.legal) platform.legal = DEFAULT_LEGAL_GOVERNANCE;
        if (!platform.commercialSaaS) platform.commercialSaaS = DEFAULT_COMMERCIAL_SAAS;
        if (!platform.ssoHub) platform.ssoHub = DEFAULT_SSO_HUB;
        if (!platform.webhookOrchestrator) platform.webhookOrchestrator = DEFAULT_WEBHOOK_ORCHESTRATOR;
        if (!platform.apiDeveloperRegistry) platform.apiDeveloperRegistry = DEFAULT_API_DEVELOPER_REGISTRY;
        if (!platform.resourceQuotaBlueprint) platform.resourceQuotaBlueprint = DEFAULT_RESOURCE_QUOTA;

        // Deep merge for nested objects if they exist but might be partial (optional but safe)
        // For now, we assume if the top-level key exists, it's fine, or we overwrite if it's strictly empty.

        await platform.save();
        console.log("✅ Platform Settings Patched".green);

        // --- SYSTEM SETTINGS ---
        console.log("🛠️  Patching System Settings...".blue);
        let system = await SystemSettings.findOne();

        if (!system) {
            console.log("   System Settings not found. Creating new...".magenta);
            system = new SystemSettings({});
        } else {
            console.log("   System Settings found. Updating missing fields...".cyan);
        }

        if (!system.core) {
            system.core = {
                storageDriver: "local",
                maxStorageLimitGB: 10,
                smtp: DEFAULT_SMTP_CONFIG,
                backup: DEFAULT_BACKUP_REGISTRY
            };
        } else {
            if (!system.core.smtp) system.core.smtp = DEFAULT_SMTP_CONFIG;
            if (!system.core.backup) system.core.backup = DEFAULT_BACKUP_REGISTRY;
            if (!system.core.storageDriver) system.core.storageDriver = "local";
        }

        if (!system.enabledModules) system.enabledModules = DEFAULT_MODULE_MAP;
        if (!system.observability) system.observability = DEFAULT_OBSERVABILITY;
        if (!system.infrastructureHub) system.infrastructureHub = {
            enableLoadBalancer: false,
            lbType: "round-robin",
            clusterNodes: [],
            cacheLayer: { driver: "internal" }
        };
        if (!system.storageRegistry) system.storageRegistry = DEFAULT_STORAGE_REGISTRY;
        if (!system.gatewayGovernance) system.gatewayGovernance = DEFAULT_GATEWAY_GOVERNANCE;
        if (!system.internationalizationHub) system.internationalizationHub = DEFAULT_INTERNATIONALIZATION;

        await system.save();
        console.log("✅ System Settings Patched".green);

        process.exit(0);

    } catch (error) {
        console.error("❌ Patch Failed:", error);
        process.exit(1);
    }
};

patchSettings();
