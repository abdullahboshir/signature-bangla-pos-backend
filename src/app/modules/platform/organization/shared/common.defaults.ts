
import type {
    ISharedBranding, ISharedSecurityHardening, ISharedCompliance,
    ISharedInternationalizationHub, ISharedOperatingHours, ISharedPaymentSettings,
    ISharedInventoryPolicy, ISharedPOSHardware, ISharedSEOPolicy,
    ISharedPrefixPolicy, ISharedMaintenancePolicy, ISharedSmtpConfig,
    ISharedBackupRegistry, ISharedResourceQuota, ISharedFinancialCore,
    ISharedReportingConfig, ISharedDataArchivalPolicy, ISharedTaxIntelligence,
    ISharedGovernancePolicy, ISharedHRMPolicy, ISharedCommunicationChannel,
    ISharedPricingPolicy, ISharedFulfillmentPolicy, ISharedRewardPointsPolicy,
    ISharedWorkflowPolicy, ISharedTemplateRegistry, ISharedDisplayPolicy,
    ISharedCheckoutPolicy, ISharedShippingPolicy, ISharedStorageRegistry,
    ISharedGatewayGovernance, ISharedAPIDeveloperRegistry, ISharedSSOHub,
    ISharedWebhookOrchestrator, ISharedObservability, ISharedLegalGovernance,
    ISharedServiceArea, ISharedCashierRegistry, ISharedModuleMap, ISharedCorporateRegistry, ISharedDocumentGovernance, ISharedCommercialSaaS
} from "./common.interface.js";

// ====== INDUSTRIAL STANDARD CENTRALIZED DEFAULTS ======

export const DEFAULT_BRANDING: ISharedBranding = {
    name: "Abdullah Bashir",
    description: "Enterprise SaaS Solution by Abdullah Bashir",
    theme: {
        primaryColor: "#0F172A",
        secondaryColor: "#334155",
        accentColor: "#F59E0B",
        fontFamily: "Inter"
    }
};

export const DEFAULT_SECURITY_HARDENING: ISharedSecurityHardening = {
    passwordPolicy: { minLength: 8, requireSpecialChar: true, requireNumber: true, expiryDays: 90 },
    sessionPolicy: { inactivityTimeoutMinutes: 30, maxConcurrentSessions: 3 },
    networkPolicy: { enableHttps: true, enableCaptcha: false, blockFailedLogins: true, ipWhitelist: [], ipBlacklist: [] },
    mfa: { requirement: "none", methods: ["email"], enforcementRoles: [] },
    sessionIsolation: { ipLock: false, deviceFingerprinting: false, maxConcurrentSessions: 3 }
};

export const DEFAULT_COMPLIANCE: ISharedCompliance = {
    gdprActive: true,
    cookieConsent: true,
    dataResidency: "cloud",
    documentRetentionYears: 7,
    piiProtection: { maskEmail: true, maskPhone: true, maskAddress: false },
    forensicAuditing: { immutableHashing: false, signAuditLogs: false, retentionYears: 10 }
};

export const DEFAULT_INTERNATIONALIZATION: ISharedInternationalizationHub = {
    supportedLanguages: [{ code: "en", name: "English", isDefault: true }],
    supportedCurrencies: [{ code: "USD", symbol: "$", exchangeRateToUSD: 1, isDefault: true }],
    defaultTimezone: "UTC",
    numberFormat: "en-US"
};

export const DEFAULT_MAINTENANCE_POLICY: ISharedMaintenancePolicy = {
    enableMaintenanceMode: false,
    allowAdmins: true,
    scheduledMaintenance: []
};

export const DEFAULT_LEGAL_GOVERNANCE: ISharedLegalGovernance = {
    legalContactEmail: "abdullahboshir@gmail.com",
    termsUrl: "https://signaturebangla.com/terms",
    privacyUrl: "https://signaturebangla.com/privacy",
    cookiePolicyUrl: "https://signaturebangla.com/cookie-policy",
    version: "1.0.0",
    lastUpdated: new Date()
};

export const DEFAULT_COMMERCIAL_SAAS: ISharedCommercialSaaS = {
    subscription: { trialPeriodDays: 14, defaultTier: "free", enableAutoRenewal: true },
    marketPresence: { enableMarketplace: true, allowCustomDomains: false, featureFlags: {} },
    aiGovernance: { enabled: false, sensitivity: "medium", preferredProvider: "openai" }
};

export const DEFAULT_SSO_HUB: ISharedSSOHub = {
    enabled: false,
    provider: "oidc",
    issuerUrl: "",
    clientId: "",
    callbackUrl: "",
    mapping: { emailField: "email", roleField: "role" }
};

export const DEFAULT_WEBHOOK_ORCHESTRATOR: ISharedWebhookOrchestrator = {
    retryPolicy: { maxRetries: 3, initialDelayMs: 1000, backoffMultiplier: 2, jitter: true },
    timeoutMs: 5000,
    signingKey: "default-key",
    deliveryMode: "parallel"
};

export const DEFAULT_API_DEVELOPER_REGISTRY: ISharedAPIDeveloperRegistry = {
    versioningEnabled: true,
    currentVersion: "v1",
    deprecatedVersions: []
};

export const DEFAULT_RESOURCE_QUOTA: ISharedResourceQuota = {
    maxUsers: 10,
    maxOutlets: 1,
    maxBusinessUnits: 1,
    maxStorageGB: 1,
    maxMonthlyTransactions: 1000,
    maxApiRequestsPerMonth: 10000,
    allowBursting: false,
    allowedModules: ["pos", "erp"]
};

export const DEFAULT_MODULE_MAP: ISharedModuleMap = {
    pos: true, erp: true, hrm: true, ecommerce: true, crm: true,
    logistics: true, finance: true, marketing: true, integrations: true,
    governance: false, saas: true
};

export const DEFAULT_SMTP_CONFIG: ISharedSmtpConfig = {
    host: "localhost",
    port: 1025,
    user: "test",
    secure: false,
    fromEmail: "test@example.com",
    fromName: "System"
};

export const DEFAULT_BACKUP_REGISTRY: ISharedBackupRegistry = {
    schedule: "daily",
    retentionCount: 7,
    encryptionEnabled: true,
    storagePath: "/backups",
    lastStatus: "pending"
};

export const DEFAULT_OBSERVABILITY: ISharedObservability = {
    enableSentry: false,
    logRetentionDays: 30,
    healthCheck: { enabled: true, intervalSeconds: 60, endpoints: ['/health', '/status'] },
    performance: { dbPoolSize: 10, redisCacheTtlSeconds: 3600, enableQueryLogging: false }
};

export const DEFAULT_STORAGE_REGISTRY: ISharedStorageRegistry = {
    provider: "local",
    bucketName: "system-storage",
    isPublic: false
};

export const DEFAULT_GATEWAY_GOVERNANCE: ISharedGatewayGovernance = {
    rateLimiting: { burst: 100, sustained: 1000, windowMs: 60000 },
    cors: { allowedOrigins: ["*"], allowCredentials: true },
    firewall: { whitelistedIps: [], blacklistedIps: [], userAgentFiltering: true }
};

export const DEFAULT_GOVERNANCE_POLICY: ISharedGovernancePolicy = {
    auditTrailSensitivity: "medium",
    retentionPeriodMonths: 12
};

export const DEFAULT_PREFIX_POLICY: ISharedPrefixPolicy = {
    customer: "CUST-", vendor: "VEND-", product: "PROD-",
    invoice: "INV-", order: "ORD-", purchase: "PUR-", expense: "EXP-",
    sku: "SKU-", supplier: "SUPP-", category: "CAT-"
};

export const DEFAULT_CORPORATE_REGISTRY: ISharedCorporateRegistry = {
    fiscalYearStartMonth: 1,
    isVatEnabled: false
};

export const DEFAULT_FINANCIAL_CORE: ISharedFinancialCore = {
    baseCurrency: "BDT",
    accountingMethod: "accrual",
    fiscalYearStartMonth: 1,
    defaultPaymentTermsDays: 30,
    autoSyncExchangeRates: true,
    allowBackdatedTransactions: false,
    bankAccounts: []
};

export const DEFAULT_DOCUMENT_GOVERNANCE: ISharedDocumentGovernance = {
    printing: { enableWatermark: false, watermarkOpacity: 0.1 },
    signatures: { showOnInvoices: false, authorizedSignatories: [] },
    invoiceLayout: { template: "standard", showLogo: true },
    invoiceSettings: { prefix: "INV-", showTaxSummary: true }
};

export const DEFAULT_REPORTING_CONFIG: ISharedReportingConfig = {
    visibleMetrics: ["sales", "profit"],
    scheduledReports: [],
    retentionDays: 365
};

export const DEFAULT_ARCHIVAL_POLICY: ISharedDataArchivalPolicy = {
    enabled: false,
    archiveAfterMonths: 60,
    compressionEnabled: true,
    deleteAfterArchive: false
};

export const DEFAULT_PRICING_POLICY: ISharedPricingPolicy = {
    isTaxInclusive: false,
    priceRounding: "nearest",
    decimalPlaces: 2,
    allowPriceOverride: true
};

export const DEFAULT_FULFILLMENT_POLICY: ISharedFulfillmentPolicy = {
    autoApproveOrders: false,
    allowOrderCancellation: true,
    cancellationWindowMinutes: 30
};

export const DEFAULT_TAX_INTELLIGENCE: ISharedTaxIntelligence = {
    enabled: true,
    pricesIncludeTax: false,
    taxType: "none",
    taxIdLabel: "VAT ID",
    defaultTaxRate: 0,
    taxBasedOn: "businessUnit",
    taxClasses: []
};

export const DEFAULT_PAYMENT_SETTINGS: ISharedPaymentSettings = {
    acceptedMethods: ["card", "cash", "bank", "mobile"],
    cashOnDelivery: true,
    bankTransfer: true,
    mobileBanking: true,
    autoCapture: true,
    transactionGuardrails: {
        maxTransactionValue: 100000,
        maxDailyVolume: 500000,
        velocityCheckEnabled: true
    },
    cashLimit: 10000,
    allowCredit: false
};

export const DEFAULT_OPERATING_HOURS: ISharedOperatingHours = {
    weekdays: { open: '09:00', close: '18:00' },
    weekends: { open: '09:00', close: '18:00', isClosed: false },
    publicHolidays: true,
    is24Hours: false,
    specialHours: []
};

export const DEFAULT_POS_HARDWARE: ISharedPOSHardware = {
    printer: { connectionType: "wifi", paperSize: "80mm" },
    display: { type: "none" },
    terminal: {}
};

export const DEFAULT_INVENTORY_POLICY: ISharedInventoryPolicy = {
    allowNegativeStock: false,
    autoReorderEnabled: true,
    lowStockThreshold: 5,
    valuationMethod: "FIFO",
    stockOutAction: "block"
};

export const DEFAULT_REWARD_POINTS_POLICY: ISharedRewardPointsPolicy = {
    enabled: false,
    pointsPerCurrency: 1,
    currencyPerPoint: 0.1,
    minimumRedemption: 100,
    expiryPeriodMonths: 12
};

export const DEFAULT_HRM_POLICY: ISharedHRMPolicy = {
    attendance: {
        enableBiometric: false,
        gracePeriodMinutes: 15,
        overtimeCalculation: true,
        workDays: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday']
    },
    payroll: {
        currency: 'BDT',
        autoGenerate: false,
        payCycle: 'monthly'
    },
    leave: {
        annualLeaveDays: 14,
        sickLeaveDays: 10,
        casualLeaveDays: 10,
        carryForwardLimit: 5
    }
};

export const DEFAULT_WORKFLOW_POLICY: ISharedWorkflowPolicy = {
    approvalThreshold: 0,
    requireManagerApproval: false,
    autoApproveBelow: 0,
    escalationPath: []
};

export const DEFAULT_TEMPLATE_REGISTRY: ISharedTemplateRegistry = {
    invoiceTemplateId: 'default',
    receiptTemplateId: 'default'
};

export const DEFAULT_COMMUNICATION_CHANNEL: ISharedCommunicationChannel = {
    email: true,
    sms: false,
    whatsapp: false,
    push: true
};

export const DEFAULT_DISPLAY_POLICY: ISharedDisplayPolicy = {
    showOutOfStock: true,
    showStockQuantity: true,
    showProductReviews: true,
    showRelatedProducts: true,
    productsPerPage: 24,
    defaultSort: "newest",
    enableQuickView: true,
};

export const DEFAULT_CHECKOUT_POLICY: ISharedCheckoutPolicy = {
    guestCheckout: true,
    requireAccount: false,
    enableCoupons: true,
    enableGiftCards: true,
    termsUrl: "",
    privacyUrl: ""
};

export const DEFAULT_SHIPPING_POLICY: ISharedShippingPolicy = {
    enabled: true,
    calculation: "flat",
    defaultRate: 0,
    handlingFee: 0,
    processingTimeDays: 2,
    shippingZones: []
};

export const DEFAULT_SERVICE_AREA: ISharedServiceArea = {
    regions: [],
    deliveryRadius: 10,
    isDeliveryAvailable: true,
    pickupAvailable: true
};

export const DEFAULT_SEO_POLICY: ISharedSEOPolicy = {
    metaRobots: 'index, follow',
    canonicalUrls: true,
    structuredData: true,
    openGraph: true,
    socialProof: {
        showPurchaseNotifications: true,
        showReviewCount: true,
        showVisitorCount: false
    }
};

export const DEFAULT_CASHIER_REGISTRY: ISharedCashierRegistry = {
    maxFloatLimit: 5000,
    allowSuspension: true,
    requireManagerApprovalForVoid: true
};
