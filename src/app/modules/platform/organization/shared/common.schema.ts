import { Schema } from "mongoose";

// ====== SHARED BRANDING SCHEMA ======
export const brandingSchema = new Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String },
    logoUrl: { type: String },
    bannerUrl: { type: String },
    faviconUrl: { type: String },
    tagline: { type: String },
    theme: {
        primaryColor: { type: String, default: "#3B82F6" },
        secondaryColor: { type: String, default: "#1E40AF" },
        accentColor: { type: String, default: "#F59E0B" },
        fontFamily: { type: String, default: "Inter" },
    },
}, { _id: false });

// Prefix policy moved to common.interface.ts

// ====== SHARED CONTACT SCHEMA ======
export const contactSchema = new Schema({
    email: { type: String, required: true },
    phone: { type: String },
    website: { type: String },
    supportPhone: { type: String },
    socialMedia: {
        facebook: { type: String },
        instagram: { type: String },
        twitter: { type: String },
        youtube: { type: String },
        linkedin: { type: String },
    },
}, { _id: false });

// ====== SHARED LOCATION SCHEMA ======
export const locationSchema = new Schema({
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    postalCode: { type: String },
    coordinates: {
        lat: { type: Number },
        lng: { type: Number },
    },
    timezone: { type: String, default: "Asia/Dhaka" },
}, { _id: false });

// ====== SHARED SMTP CONFIG SCHEMA ======
export const smtpConfigSchema = new Schema({
    host: { type: String, required: true },
    port: { type: Number, required: true },
    user: { type: String, required: true },
    password: { type: String, select: false },
    secure: { type: Boolean, default: true },
    fromEmail: { type: String, required: true },
    fromName: { type: String, required: true },
}, { _id: false });

// ====== SHARED BACKUP REGISTRY SCHEMA ======
export const backupRegistrySchema = new Schema({
    schedule: { type: String, enum: ["daily", "weekly", "monthly"], default: "daily" },
    retentionCount: { type: Number, default: 7 },
    storagePath: { type: String },
    encryptionEnabled: { type: Boolean, default: true },
    lastBackupDate: { type: Date },
    lastStatus: { type: String, enum: ["success", "failed", "pending"], default: "pending" },
}, { _id: false });

// ====== SHARED SECURITY HARDENING SCHEMA ======
export const securityHardeningSchema = new Schema({
    passwordPolicy: {
        minLength: { type: Number, default: 8 },
        requireSpecialChar: { type: Boolean, default: true },
        requireNumber: { type: Boolean, default: true },
        expiryDays: { type: Number, default: 90 },
    },
    sessionPolicy: {
        inactivityTimeoutMinutes: { type: Number, default: 30 },
        maxConcurrentSessions: { type: Number, default: 3 },
    },
    networkPolicy: {
        enableHttps: { type: Boolean, default: true },
        enableCaptcha: { type: Boolean, default: false },
        blockFailedLogins: { type: Boolean, default: true },
        ipWhitelist: [{ type: String }],
        ipBlacklist: [{ type: String }],
    },
    mfa: {
        requirement: { type: String, enum: ["none", "optional", "mandatory"], default: "none" },
        methods: { type: [String], enum: ["email", "sms", "otp"], default: ["email"] },
        enforcementRoles: [{ type: String }],
    },
    sessionIsolation: {
        ipLock: { type: Boolean, default: false },
        deviceFingerprinting: { type: Boolean, default: false },
        maxConcurrentSessions: { type: Number, default: 3 },
    }
}, { _id: false });

// ====== SHARED OPERATING HOURS SCHEMA ======
export const operatingHoursSchema = new Schema({
    weekdays: {
        open: { type: String, default: '09:00' },
        close: { type: String, default: '18:00' },
    },
    weekends: {
        open: { type: String, default: '09:00' },
        close: { type: String, default: '18:00' },
        isClosed: { type: Boolean, default: false },
    },
    publicHolidays: { type: Boolean, default: true },
    is24Hours: { type: Boolean, default: false },
    specialHours: [{
        date: { type: Date },
        open: { type: String },
        close: { type: String },
        isClosed: { type: Boolean, default: false },
        reason: { type: String },
    }],
}, { _id: false });

// ====== SHARED TAX INTELLIGENCE SCHEMA ======
export const taxIntelligenceSchema = new Schema({
    enabled: { type: Boolean, default: true },
    pricesIncludeTax: { type: Boolean, default: false },
    taxType: { type: String, enum: ["vat", "gst", "sales_tax", "none"], default: "none" },
    taxIdLabel: { type: String, default: "Tax ID" },
    taxBasedOn: { type: String, enum: ["shipping", "billing", "businessUnit"], default: "businessUnit" },
    defaultTaxRate: { type: Number, default: 0 },
    jurisdiction: { type: String },
    taxClasses: [{
        name: { type: String },
        rate: { type: Number },
        countries: [String],
        states: [String],
        effectiveDate: { type: Date }
    }],
    reporting: {
        enabled: { type: Boolean, default: true },
        frequency: { type: String, enum: ["monthly", "quarterly", "annually"], default: "monthly" },
        format: { type: String, enum: ["pdf", "csv", "excel"], default: "pdf" },
    }
}, { _id: false });

// ====== SHARED PAYMENT SETTINGS SCHEMA ======
export const paymentSettingsSchema = new Schema({
    acceptedMethods: { type: [String], default: ["card", "cash", "bank", "mobile"] },
    cashOnDelivery: { type: Boolean, default: true },
    bankTransfer: { type: Boolean, default: true },
    mobileBanking: { type: Boolean, default: true },
    autoCapture: { type: Boolean, default: true },
    paymentInstructions: { type: String },
    transactionGuardrails: {
        maxTransactionValue: { type: Number, default: 100000 },
        maxDailyVolume: { type: Number, default: 500000 },
        velocityCheckEnabled: { type: Boolean, default: true },
    },
    cashLimit: { type: Number },
    allowCredit: { type: Boolean, default: false },
}, { _id: false });

// ====== SHARED INVENTORY POLICY SCHEMA ======
export const inventoryPolicySchema = new Schema({
    valuationMethod: { type: String, enum: ["FIFO", "LIFO", "AVCO"], default: "FIFO" },
    allowNegativeStock: { type: Boolean, default: false },
    stockOutAction: { type: String, enum: ["block", "warning", "ignore"], default: "block" },
    autoReorderEnabled: { type: Boolean, default: true },
    lowStockThreshold: { type: Number, default: 5 },
}, { _id: false });

// ====== SHARED POS HARDWARE SCHEMA ======
export const posHardwareSchema = new Schema({
    printer: {
        ipAddress: { type: String },
        port: { type: Number, default: 9100 },
        connectionType: { type: String, enum: ["wifi", "usb", "bluetooth"], default: "wifi" },
        paperSize: { type: String, enum: ["58mm", "80mm"], default: "80mm" },
    },
    display: {
        type: { type: String, enum: ["none", "cfd", "kds"], default: "none" },
        ipAddress: { type: String },
    },
    terminal: {
        hardwareId: { type: String },
        macAddress: { type: String },
    },
}, { _id: false });

// ====== SHARED COMPLIANCE SCHEMA ======
export const complianceSchema = new Schema({
    gdprActive: { type: Boolean, default: false },
    cookieConsent: { type: Boolean, default: false },
    dataResidency: { type: String, enum: ["local", "cloud", "regional"], default: "local" },
    documentRetentionYears: { type: Number, default: 7 },
    piiProtection: {
        maskEmail: { type: Boolean, default: false },
        maskPhone: { type: Boolean, default: false },
        maskAddress: { type: Boolean, default: false },
    },
    forensicAuditing: {
        immutableHashing: { type: Boolean, default: false },
        signAuditLogs: { type: Boolean, default: false },
        retentionYears: { type: Number, default: 10 },
    },
}, { _id: false });

export const moduleMapSchema = new Schema({
    pos: { type: Boolean, default: true },
    erp: { type: Boolean, default: true },
    hrm: { type: Boolean, default: true },
    ecommerce: { type: Boolean, default: true },
    crm: { type: Boolean, default: true },
    logistics: { type: Boolean, default: true },
    finance: { type: Boolean, default: true },
    marketing: { type: Boolean, default: true },
    integrations: { type: Boolean, default: true },
    governance: { type: Boolean, default: false },
    saas: { type: Boolean, default: true }
}, { _id: false });

export const infrastructureHubSchema = new Schema({
    enableLoadBalancer: { type: Boolean, default: false },
    lbType: { type: String, enum: ["round-robin", "least-connections"], default: "round-robin" },
    clusterNodes: [{ type: String }],
    cacheLayer: {
        driver: { type: String, enum: ["redis", "memcached", "internal"], default: "internal" },
        connectionString: { type: String }
    }
}, { _id: false });

export const corporateRegistrySchema = new Schema({
    taxIdentificationNumber: { type: String },
    vatNumber: { type: String },
    tradeLicenseNumber: { type: String },
    businessRegistrationNumber: { type: String },
    incorporationDate: { type: Date },
    fiscalYearStartMonth: { type: Number, default: 1 },
    isVatEnabled: { type: Boolean, default: false },
    defaultTaxGroup: { type: String }
}, { _id: false });

// ====== SHARED SYSTEM CORE SCHEMA ======
export const systemCoreSchema = new Schema({
    storageDriver: { type: String, enum: ["local", "s3", "cloudinary", "gcs", "azure"], default: "local" },
    maxStorageLimitGB: { type: Number },
    smtp: { type: smtpConfigSchema, required: true },
    backup: { type: backupRegistrySchema, required: true }
}, { _id: false });

export const governancePolicySchema = new Schema({
    auditTrailSensitivity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    retentionPeriodMonths: { type: Number, default: 12 }
}, { _id: false });

// Merged into securityHardeningSchema

// ====== SHARED COMMUNICATION CHANNEL SCHEMA ======
export const communicationChannelSchema = new Schema({
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    whatsapp: { type: Boolean, default: false },
    push: { type: Boolean, default: true },
}, { _id: false });

// ====== SHARED WORKFLOW POLICY SCHEMA ======
export const workflowPolicySchema = new Schema({
    approvalThreshold: { type: Number, default: 0 },
    requireManagerApproval: { type: Boolean, default: false },
    autoApproveBelow: { type: Number, default: 0 },
    escalationPath: [{ type: String }],
}, { _id: false });

// ====== SHARED FISCAL PERIOD SCHEMA ======
export const fiscalPeriodSchema = new Schema({
    periodName: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isClosed: { type: Boolean, default: false },
    closedAt: { type: Date },
    closedBy: { type: String },
}, { _id: false });

// ====== SHARED REPORTING CONFIG SCHEMA ======
export const reportingConfigSchema = new Schema({
    visibleMetrics: [{ type: String }],
    scheduledReports: [{
        reportType: { type: String },
        frequency: { type: String, enum: ["daily", "weekly", "monthly"], default: "weekly" },
        recipients: [{ type: String }],
    }],
    retentionDays: { type: Number, default: 365 },
}, { _id: false });

export const apiDeveloperRegistrySchema = new Schema({
    versioningEnabled: { type: Boolean, default: true },
    currentVersion: { type: String, default: "v1" },
    deprecatedVersions: [{ type: String }]
}, { _id: false });

// ====== SHARED TEMPLATE REGISTRY SCHEMA ======
export const templateRegistrySchema = new Schema({
    invoiceTemplateId: { type: String },
    receiptTemplateId: { type: String },
    emailHeaderId: { type: String },
    smsGatewayId: { type: String },
}, { _id: false });

// ====== SHARED PRICING POLICY SCHEMA ======
export const pricingPolicySchema = new Schema({
    isTaxInclusive: { type: Boolean, default: false },
    priceRounding: { type: String, enum: ["nearest", "floor", "ceiling"], default: "nearest" },
    decimalPlaces: { type: Number, default: 2 },
    allowPriceOverride: { type: Boolean, default: true },
}, { _id: false });

// ====== SHARED FULFILLMENT POLICY SCHEMA ======
export const fulfillmentPolicySchema = new Schema({
    autoApproveOrders: { type: Boolean, default: false },
    allowOrderCancellation: { type: Boolean, default: true },
    cancellationWindowMinutes: { type: Number, default: 30 },
}, { _id: false });

// ====== SHARED REWARD POINTS POLICY SCHEMA ======
export const rewardPointsPolicySchema = new Schema({
    enabled: { type: Boolean, default: false },
    pointsPerCurrency: { type: Number, default: 1 },
    currencyPerPoint: { type: Number, default: 0.1 },
    minimumRedemption: { type: Number, default: 100 },
    expiryPeriodMonths: { type: Number, default: 12 },
}, { _id: false });

// ====== SHARED HRM POLICY SCHEMA ======
export const hrmPolicySchema = new Schema({
    attendance: {
        enableBiometric: { type: Boolean, default: false },
        gracePeriodMinutes: { type: Number, default: 15 },
        overtimeCalculation: { type: Boolean, default: true },
        workDays: [{ type: String, default: ["monday", "tuesday", "wednesday", "thursday", "friday"] }],
    },
    payroll: {
        currency: { type: String, default: "BDT" },
        autoGenerate: { type: Boolean, default: false },
        payCycle: { type: String, enum: ["monthly", "weekly"], default: "monthly" },
    },
    leave: {
        annualLeaveDays: { type: Number, default: 14 },
        sickLeaveDays: { type: Number, default: 10 },
        casualLeaveDays: { type: Number, default: 10 },
        carryForwardLimit: { type: Number, default: 5 },
    },
}, { _id: false });

// ====== SHARED SHIPPING POLICY SCHEMA ======
export const shippingPolicySchema = new Schema({
    enabled: { type: Boolean, default: true },
    calculation: { type: String, enum: ["flat", "weight", "price", "free"], default: "flat" },
    defaultRate: { type: Number, default: 0 },
    freeShippingMinimum: { type: Number },
    handlingFee: { type: Number, default: 0 },
    processingTimeDays: { type: Number, default: 2 },
    shippingZones: [{
        name: { type: String, required: true },
        countries: [{ type: String }],
        rates: [{
            minWeight: { type: Number },
            maxWeight: { type: Number },
            cost: { type: Number, required: true },
        }],
    }],
}, { _id: false });

// ====== SHARED SEO POLICY SCHEMA ======
export const seoPolicySchema = new Schema({
    metaRobots: { type: String, default: "index, follow" },
    canonicalUrls: { type: Boolean, default: true },
    structuredData: { type: Boolean, default: true },
    openGraph: { type: Boolean, default: true },
    socialProof: {
        showPurchaseNotifications: { type: Boolean, default: true },
        showReviewCount: { type: Boolean, default: true },
        showVisitorCount: { type: Boolean, default: false },
    },
}, { _id: false });

// ====== SHARED CHECKOUT POLICY SCHEMA ======
export const checkoutPolicySchema = new Schema({
    guestCheckout: { type: Boolean, default: true },
    requireAccount: { type: Boolean, default: false },
    enableCoupons: { type: Boolean, default: true },
    enableGiftCards: { type: Boolean, default: true },
    minimumOrderAmount: { type: Number },
    termsUrl: { type: String },
    privacyUrl: { type: String },
}, { _id: false });

// ====== SHARED DISPLAY POLICY SCHEMA ======
export const displayPolicySchema = new Schema({
    showOutOfStock: { type: Boolean, default: true },
    showStockQuantity: { type: Boolean, default: true },
    showProductReviews: { type: Boolean, default: true },
    showRelatedProducts: { type: Boolean, default: true },
    productsPerPage: { type: Number, default: 24 },
    defaultSort: { type: String, enum: ["newest", "popular", "price_low", "price_high"], default: "newest" },
    enableQuickView: { type: Boolean, default: true },
}, { _id: false });

// ====== SHARED PREFIX POLICY SCHEMA ======
export const prefixPolicySchema = new Schema({
    invoice: { type: String, default: "INV-" },
    order: { type: String, default: "ORD-" },
    purchase: { type: String, default: "PUR-" },
    sku: { type: String, default: "SKU-" },
    customer: { type: String, default: "CUST-" },
    supplier: { type: String, default: "SUPP-" },
    vendor: { type: String, default: "VEND-" },
    product: { type: String, default: "PROD-" },
    expense: { type: String, default: "EXP-" },
    category: { type: String, default: "CAT-" }
}, { _id: false });

// ====== SHARED MAINTENANCE POLICY SCHEMA ======
export const maintenancePolicySchema = new Schema({
    enableMaintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: { type: String },
    allowAdmins: { type: Boolean, default: true },
    scheduledMaintenance: [{
        start: { type: Date },
        end: { type: Date },
        message: { type: String },
    }],
}, { _id: false });

// ====== INDUSTRIAL PEAK GOD-TIER SCHEMAS ======

export const storageRegistrySchema = new Schema({
    provider: { type: String, enum: ["aws", "google", "azure", "local", "cloudinary"], default: "local" },
    bucketName: { type: String },
    region: { type: String },
    endpoint: { type: String },
    accessKey: { type: String, select: false }, // Encrypted at service level
    secretKey: { type: String, select: false }, // Encrypted at service level
    isPublic: { type: Boolean, default: false },
    cdnUrl: { type: String },
}, { _id: false });

export const gatewayGovernanceSchema = new Schema({
    rateLimiting: {
        burst: { type: Number, default: 100 },
        sustained: { type: Number, default: 1000 },
        windowMs: { type: Number, default: 60000 },
    },
    cors: {
        allowedOrigins: [{ type: String }],
        allowCredentials: { type: Boolean, default: true },
    },
    firewall: {
        whitelistedIps: [{ type: String }],
        blacklistedIps: [{ type: String }],
        userAgentFiltering: { type: Boolean, default: true },
    },
}, { _id: false });

export const ssoHubSchema = new Schema({
    enabled: { type: Boolean, default: false },
    provider: { type: String, enum: ["okta", "auth0", "saml", "oidc"], default: "oidc" },
    issuerUrl: { type: String },
    clientId: { type: String },
    clientSecret: { type: String, select: false },
    callbackUrl: { type: String },
    mapping: {
        emailField: { type: String, default: "email" },
        roleField: { type: String, default: "role" },
    },
}, { _id: false });

export const webhookOrchestratorSchema = new Schema({
    retryPolicy: {
        maxRetries: { type: Number, default: 3 },
        initialDelayMs: { type: Number, default: 1000 },
        backoffMultiplier: { type: Number, default: 2 },
        jitter: { type: Boolean, default: true },
    },
    timeoutMs: { type: Number, default: 5000 },
    signingKey: { type: String, select: false },
    deliveryMode: { type: String, enum: ["sequential", "parallel"], default: "parallel" },
}, { _id: false });

export const dataArchivalPolicySchema = new Schema({
    enabled: { type: Boolean, default: false },
    archiveAfterMonths: { type: Number, default: 60 },
    coldStorageProvider: { type: String },
    compressionEnabled: { type: Boolean, default: true },
    deleteAfterArchive: { type: Boolean, default: false },
}, { _id: false });

// ====== DEITY-TIER INDUSTRIAL SCHEMAS ======

export const resourceQuotaSchema = new Schema({
    maxUsers: { type: Number, default: 0 },
    maxOutlets: { type: Number, default: 0 },
    maxBusinessUnits: { type: Number, default: 0 },
    maxStorageGB: { type: Number, default: 1 },
    maxMonthlyTransactions: { type: Number, default: 0 },
    maxApiRequestsPerMonth: { type: Number, default: 100000 },
    allowBursting: { type: Boolean, default: false },
    allowedModules: [{ type: String }]
}, { _id: false });

export const integrationRegistrySchema = new Schema({
    provider: { type: String, required: true },
    category: { type: String, enum: ["payment", "sms", "email", "shipping", "analytics", "crm"], required: true },
    isEnabled: { type: Boolean, default: false },
    credentials: { type: Map, of: Schema.Types.Mixed }, // Should be encrypted
    webhookUrl: { type: String },
    metadata: { type: Map, of: Schema.Types.Mixed },
}, { _id: false });

export const internationalizationHubSchema = new Schema({
    supportedLanguages: [{
        code: { type: String, required: true },
        name: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
    }],
    supportedCurrencies: [{
        code: { type: String, required: true },
        symbol: { type: String, required: true },
        exchangeRateToUSD: { type: Number, default: 1 },
        isDefault: { type: Boolean, default: false },
    }],
    defaultTimezone: { type: String, default: "UTC" },
    numberFormat: { type: String, default: "en-US" },
}, { _id: false });

// Merged into taxIntelligenceSchema

export const roleBlueprintSchema = new Schema({
    name: { type: String, required: true },
    key: { type: String, required: true },
    description: { type: String },
    permissions: [{
        resource: { type: String, required: true },
        actions: [{ type: String }],
    }],
    isSystemDefined: { type: Boolean, default: true },
}, { _id: false });

// ====== FINAL ZENITH SHARED SCHEMAS ======

export const observabilitySchema = new Schema({
    enableSentry: { type: Boolean, default: false },
    sentryDsn: { type: String, select: false },
    logRetentionDays: { type: Number, default: 30 },
    healthCheck: {
        enabled: { type: Boolean, default: true },
        intervalSeconds: { type: Number, default: 60 },
        endpoints: [{ type: String }],
    },
    performance: {
        dbPoolSize: { type: Number, default: 10 },
        redisCacheTtlSeconds: { type: Number, default: 3600 },
        enableQueryLogging: { type: Boolean, default: false },
    },
}, { _id: false });

export const legalGovernanceSchema = new Schema({
    termsUrl: { type: String },
    privacyUrl: { type: String },
    cookiePolicyUrl: { type: String },
    legalContactEmail: { type: String },
    version: { type: String, default: "1.0.0" },
    lastUpdated: { type: Date, default: Date.now },
}, { _id: false });

export const financialCoreSchema = new Schema({
    baseCurrency: { type: String, default: "BDT" },
    accountingMethod: { type: String, enum: ["cash", "accrual"], default: "accrual" },
    fiscalYearStartMonth: { type: Number, default: 1 },
    defaultPaymentTermsDays: { type: Number, default: 30 },
    financialLockDate: { type: Date },
    autoSyncExchangeRates: { type: Boolean, default: true },
    allowBackdatedTransactions: { type: Boolean, default: false },
    bankAccounts: [{
        bankName: { type: String, required: true },
        accountNumber: { type: String, required: true },
        accountName: { type: String, required: true },
        accountType: { type: String, enum: ["savings", "current", "corporate"], default: "current" },
        branch: { type: String },
        routingNumber: { type: String },
        swiftCode: { type: String },
        isPrimary: { type: Boolean, default: false },
    }],
}, { _id: false });

export const documentGovernanceSchema = new Schema({
    printing: {
        enableWatermark: { type: Boolean, default: false },
        watermarkText: { type: String },
        watermarkOpacity: { type: Number, default: 0.1 },
    },
    signatures: {
        digitalSignatureUrl: { type: String },
        showOnInvoices: { type: Boolean, default: false },
        authorizedSignatories: [{ type: String }],
    },
    invoiceLayout: {
        template: { type: String, default: "standard" },
        showLogo: { type: Boolean, default: true },
        footerText: { type: String },
    },
    invoiceSettings: {
        prefix: { type: String, default: "INV-" },
        footerText: { type: String },
        showTaxSummary: { type: Boolean, default: true }
    }
}, { _id: false });

export const commercialSaaSSchema = new Schema({
    subscription: {
        trialPeriodDays: { type: Number, default: 14 },
        defaultTier: { type: String, default: "free" },
        enableAutoRenewal: { type: Boolean, default: true },
    },
    marketPresence: {
        enableMarketplace: { type: Boolean, default: true },
        allowCustomDomains: { type: Boolean, default: false },
        featureFlags: { type: Map, of: Boolean, default: {} },
    },
    aiGovernance: {
        enabled: { type: Boolean, default: false },
        sensitivity: { type: String, enum: ["low", "medium", "high"], default: "medium" },
        preferredProvider: { type: String, default: "openai" },
    },
}, { _id: false });

export const serviceAreaSchema = new Schema({
    regions: [{ type: String }],
    deliveryRadius: { type: Number, default: 5 },
    isDeliveryAvailable: { type: Boolean, default: true },
    pickupAvailable: { type: Boolean, default: true },
    lastUpdated: { type: Date, default: Date.now }
}, { _id: false });

export const cashierRegistrySchema = new Schema({
    maxFloatLimit: { type: Number, default: 10000 },
    allowSuspension: { type: Boolean, default: true },
    requireManagerApprovalForVoid: { type: Boolean, default: false },
    defaultCashRegisterId: { type: String }
}, { _id: false });
