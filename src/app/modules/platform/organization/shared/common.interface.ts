export interface ISharedBranding {
    name: string;
    description?: string;
    logoUrl?: string;
    bannerUrl?: string;
    faviconUrl?: string;
    tagline?: string;
    theme: {
        primaryColor: string;
        secondaryColor: string;
        accentColor: string;
        fontFamily: string;
    };
}

export interface ISharedContact {
    email: string;
    phone?: string;
    website?: string;
    supportPhone?: string;
    socialMedia?: {
        facebook?: string;
        instagram?: string;
        twitter?: string;
        youtube?: string;
        linkedin?: string;
    };
}

export interface ISharedLocation {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
    timezone: string;
}

export interface ISharedSecurityHardening {
    passwordPolicy: {
        minLength: number;
        requireSpecialChar: boolean;
        requireNumber: boolean;
        expiryDays: number;
    };
    sessionPolicy: {
        inactivityTimeoutMinutes: number;
        maxConcurrentSessions: number;
    };
    networkPolicy: {
        enableHttps: boolean;
        enableCaptcha: boolean;
        blockFailedLogins: boolean;
        ipWhitelist: string[];
        ipBlacklist: string[];
    };
    mfa: {
        requirement: "none" | "optional" | "mandatory";
        methods: Array<"email" | "sms" | "otp">;
        enforcementRoles: string[];
    };
    sessionIsolation: {
        ipLock: boolean;
        deviceFingerprinting: boolean;
        maxConcurrentSessions: number;
    };
}

export interface ISharedOperatingHours {
    weekdays: { open: string; close: string };
    weekends: { open: string; close: string; isClosed: boolean };
    publicHolidays: boolean;
    is24Hours: boolean;
    specialHours?: Array<{
        date: Date;
        open: string;
        close: string;
        isClosed: boolean;
        reason: string;
    }>;
}

export interface ISharedTaxIntelligence {
    enabled: boolean;
    pricesIncludeTax: boolean;
    taxType: "vat" | "gst" | "sales_tax" | "none";
    taxIdLabel: string; // e.g., "VAT ID", "GSTIN"
    taxBasedOn: "shipping" | "billing" | "businessUnit";
    defaultTaxRate: number;
    jurisdiction?: string;
    taxClasses: Array<{
        name: string;
        rate: number;
        countries: string[];
        states?: string[];
        effectiveDate?: Date;
    }>;
}

export interface ISharedPaymentSettings {
    acceptedMethods: string[];
    cashOnDelivery: boolean;
    bankTransfer: boolean;
    mobileBanking: boolean;
    autoCapture: boolean;
    paymentInstructions?: string;
    transactionGuardrails: {
        maxTransactionValue: number;
        maxDailyVolume: number;
        velocityCheckEnabled: boolean;
    };
    cashLimit?: number;
    allowCredit?: boolean;
}

export interface ISharedInventoryPolicy {
    valuationMethod: "FIFO" | "LIFO" | "AVCO";
    allowNegativeStock: boolean;
    stockOutAction: "block" | "warning" | "ignore";
    autoReorderEnabled: boolean;
    lowStockThreshold: number;
}

export interface ISharedPOSHardware {
    printer: {
        ipAddress?: string;
        port?: number;
        connectionType: "wifi" | "usb" | "bluetooth";
        paperSize: "58mm" | "80mm";
    };
    display: {
        type: "none" | "cfd" | "kds";
        ipAddress?: string;
    };
    terminal: {
        hardwareId?: string;
        macAddress?: string;
    };
}

export interface ISharedCompliance {
    gdprActive: boolean;
    cookieConsent: boolean;
    dataResidency: "local" | "cloud" | "regional";
    documentRetentionYears: number;
    piiProtection: {
        maskEmail: boolean;
        maskPhone: boolean;
        maskAddress: boolean;
    };
    forensicAuditing: {
        immutableHashing: boolean;
        signAuditLogs: boolean;
        retentionYears: number;
    };
}

export interface ISharedModuleMap {
    pos: boolean;
    erp: boolean;
    hrm: boolean;
    ecommerce: boolean;
    crm: boolean;
    logistics: boolean;
    finance: boolean;
    marketing: boolean;
    integrations: boolean;
    governance: boolean;
    saas: boolean;
}

export interface ISharedInfrastructureHub {
    enableLoadBalancer: boolean;
    lbType: "round-robin" | "least-connections";
    clusterNodes: string[];
    cacheLayer: {
        driver: "redis" | "memcached" | "internal";
        connectionString?: string;
    };
}

export interface ISharedCorporateRegistry {
    taxIdentificationNumber?: string;
    vatNumber?: string;
    tradeLicenseNumber?: string;
    businessRegistrationNumber?: string;
    incorporationDate?: Date;
    fiscalYearStartMonth: number;
    isVatEnabled: boolean;
    defaultTaxGroup?: string;
}

export interface ISharedSystemCore {
    storageDriver: 'local' | 's3' | 'cloudinary' | 'gcs' | 'azure';
    maxStorageLimitGB?: number;
    smtp: ISharedSmtpConfig;
    backup: ISharedBackupRegistry;
}

export interface ISharedGovernancePolicy {
    auditTrailSensitivity: 'low' | 'medium' | 'high';
    retentionPeriodMonths: number;
}

// Merged into SecurityHardening

export interface ISharedCommunicationChannel {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
    push: boolean;
}

export interface ISharedWorkflowPolicy {
    approvalThreshold: number;
    requireManagerApproval: boolean;
    autoApproveBelow: number;
    escalationPath: string[]; // Role IDs or names
}

export interface ISharedFiscalPeriod {
    periodName: string;
    startDate: Date;
    endDate: Date;
    isClosed: boolean;
    closedAt?: Date;
    closedBy?: string;
}

export interface ISharedReportingConfig {
    visibleMetrics: string[];
    scheduledReports: Array<{
        reportType: string;
        frequency: "daily" | "weekly" | "monthly";
        recipients: string[];
    }>;
    retentionDays: number;
}

export interface ISharedTemplateRegistry {
    invoiceTemplateId?: string;
    receiptTemplateId?: string;
    emailHeaderId?: string;
    smsGatewayId?: string;
}

export interface ISharedPricingPolicy {
    isTaxInclusive: boolean;
    priceRounding: "nearest" | "floor" | "ceiling";
    decimalPlaces: number;
    allowPriceOverride: boolean;
}

export interface ISharedFulfillmentPolicy {
    autoApproveOrders: boolean;
    allowOrderCancellation: boolean;
    cancellationWindowMinutes: number;
}

export interface ISharedRewardPointsPolicy {
    enabled: boolean;
    pointsPerCurrency: number;
    currencyPerPoint: number;
    minimumRedemption: number;
    expiryPeriodMonths: number;
}

export interface ISharedHRMPolicy {
    attendance: {
        enableBiometric: boolean;
        gracePeriodMinutes: number;
        overtimeCalculation: boolean;
        workDays: string[];
    };
    payroll: {
        currency: string;
        autoGenerate: boolean;
        payCycle: "monthly" | "weekly";
    };
    leave: {
        annualLeaveDays: number;
        sickLeaveDays: number;
        casualLeaveDays: number;
        carryForwardLimit: number;
    };
}

export interface ISharedShippingPolicy {
    enabled: boolean;
    calculation: "flat" | "weight" | "price" | "free";
    defaultRate: number;
    freeShippingMinimum?: number;
    handlingFee: number;
    processingTimeDays: number;
    shippingZones: Array<{
        name: string;
        countries: string[];
        rates: Array<{
            minWeight?: number;
            maxWeight?: number;
            cost: number;
        }>;
    }>;
}

export interface ISharedSEOPolicy {
    metaRobots: string;
    canonicalUrls: boolean;
    structuredData: boolean;
    openGraph: boolean;
    socialProof: {
        showPurchaseNotifications: boolean;
        showReviewCount: boolean;
        showVisitorCount: boolean;
    };
}

export interface ISharedCheckoutPolicy {
    guestCheckout: boolean;
    requireAccount: boolean;
    enableCoupons: boolean;
    enableGiftCards: boolean;
    minimumOrderAmount?: number;
    termsUrl?: string;
    privacyUrl?: string;
}

export interface ISharedDisplayPolicy {
    showOutOfStock: boolean;
    showStockQuantity: boolean;
    showProductReviews: boolean;
    showRelatedProducts: boolean;
    productsPerPage: number;
    defaultSort: "newest" | "popular" | "price_low" | "price_high";
    enableQuickView: boolean;
}

export interface ISharedPrefixPolicy {
    invoice: string;
    order: string;
    purchase: string;
    sku: string;
    customer?: string;
    supplier?: string;
    vendor?: string;
    product?: string;
    expense?: string;
    category?: string;
}

export interface ISharedMaintenancePolicy {
    enableMaintenanceMode: boolean;
    maintenanceMessage?: string;
    allowAdmins: boolean;
    scheduledMaintenance?: Array<{
        start: Date;
        end: Date;
        message: string;
    }>;
}

// ====== INDUSTRIAL PEAK GOD-TIER HUBS ======

export interface ISharedStorageRegistry {
    provider: "aws" | "google" | "azure" | "local" | "cloudinary";
    bucketName: string;
    region?: string;
    endpoint?: string;
    accessKey?: string; // Encrypted in DB
    secretKey?: string; // Encrypted in DB
    isPublic: boolean;
    cdnUrl?: string;
}

export interface ISharedGatewayGovernance {
    rateLimiting: {
        burst: number;
        sustained: number;
        windowMs: number;
    };
    cors: {
        allowedOrigins: string[];
        allowCredentials: boolean;
    };
    firewall: {
        whitelistedIps: string[];
        blacklistedIps: string[];
        userAgentFiltering: boolean;
    };
}

export interface ISharedAPIDeveloperRegistry {
    versioningEnabled: boolean;
    currentVersion: string;
    deprecatedVersions: string[];
}

export interface ISharedSSOHub {
    enabled: boolean;
    provider: "okta" | "auth0" | "saml" | "oidc";
    issuerUrl: string;
    clientId: string;
    clientSecret?: string; // Encrypted
    callbackUrl: string;
    mapping: {
        emailField: string;
        roleField: string;
    };
}

export interface ISharedWebhookOrchestrator {
    retryPolicy: {
        maxRetries: number;
        initialDelayMs: number;
        backoffMultiplier: number;
        jitter: boolean;
    };
    timeoutMs: number;
    signingKey: string; // Used to sign payloads
    deliveryMode: "sequential" | "parallel";
}

export interface ISharedDataArchivalPolicy {
    enabled: boolean;
    archiveAfterMonths: number;
    coldStorageProvider?: string;
    compressionEnabled: boolean;
    deleteAfterArchive: boolean;
}

export interface ISharedBackupRegistry {
    schedule: "daily" | "weekly" | "monthly";
    retentionCount: number;
    storagePath: string;
    encryptionEnabled: boolean;
    lastBackupDate?: Date;
    lastStatus: "success" | "failed" | "pending";
}

// ====== DEITY-TIER INDUSTRIAL INTERFACES ======

export interface ISharedResourceQuota {
    maxUsers: number;
    maxOutlets: number;
    maxBusinessUnits: number;
    maxStorageGB: number;
    maxMonthlyTransactions: number;
    maxApiRequestsPerMonth: number;
    allowBursting: boolean;
    allowedModules: string[];
}

export interface ISharedIntegrationRegistry {
    provider: string;
    category: "payment" | "sms" | "email" | "shipping" | "analytics" | "crm";
    isEnabled: boolean;
    credentials: Record<string, any>; // Encrypted at service layer
    webhookUrl?: string;
    metadata?: Record<string, any>;
}

export interface ISharedInternationalizationHub {
    supportedLanguages: Array<{
        code: string;
        name: string;
        isDefault: boolean;
    }>;
    supportedCurrencies: Array<{
        code: string;
        symbol: string;
        exchangeRateToUSD: number;
        isDefault: boolean;
    }>;
    defaultTimezone: string;
    numberFormat: string; // e.g., "en-US"
}

// Merged into TaxIntelligence

export interface ISharedRoleBlueprint {
    name: string;
    key: string;
    description?: string;
    permissions: Array<{
        resource: string;
        actions: string[];
    }>;
    isSystemDefined: boolean;
}

// ====== FINAL ZENITH SHARED INTERFACES ======

export interface ISharedObservability {
    enableSentry: boolean;
    sentryDsn?: string;
    logRetentionDays: number;
    healthCheck: {
        enabled: boolean;
        intervalSeconds: number;
        endpoints: string[];
    };
    performance: {
        dbPoolSize: number;
        redisCacheTtlSeconds: number;
        enableQueryLogging: boolean;
    };
}

export interface ISharedSmtpConfig {
    host: string;
    port: number;
    user: string;
    password?: string; // Encrypted
    secure: boolean;
    fromEmail: string;
    fromName: string;
}

export interface ISharedLegalGovernance {
    termsUrl?: string;
    privacyUrl?: string;
    cookiePolicyUrl?: string;
    legalContactEmail?: string;
    version: string;
    lastUpdated: Date;
}

export interface ISharedFinancialCore {
    baseCurrency: string;
    accountingMethod: "cash" | "accrual";
    fiscalYearStartMonth: number;
    defaultPaymentTermsDays: number;
    financialLockDate?: Date;
    autoSyncExchangeRates: boolean;
    allowBackdatedTransactions: boolean;
    bankAccounts: Array<{
        bankName: string;
        accountNumber: string;
        accountName: string;
        accountType: "savings" | "current" | "corporate";
        branch?: string;
        routingNumber?: string;
        swiftCode?: string;
        isPrimary: boolean;
    }>;
}

export interface ISharedDocumentGovernance {
    printing: {
        enableWatermark: boolean;
        watermarkText?: string;
        watermarkOpacity: number;
    };
    signatures: {
        digitalSignatureUrl?: string;
        showOnInvoices: boolean;
        authorizedSignatories: string[];
    };
    invoiceLayout: {
        template: string;
        showLogo: boolean;
        footerText?: string;
    };
    invoiceSettings: {
        prefix: string;
        footerText?: string;
        showTaxSummary: boolean;
    };
}

export interface ISharedCommercialSaaS {
    subscription: {
        trialPeriodDays: number;
        defaultTier: string;
        enableAutoRenewal: boolean;
    };
    marketPresence: {
        enableMarketplace: boolean;
        allowCustomDomains: boolean;
        featureFlags: Record<string, boolean>;
    };
    aiGovernance: {
        enabled: boolean;
        sensitivity: "low" | "medium" | "high";
        preferredProvider: string;
    };
}

export interface ISharedServiceArea {
    regions: string[];
    deliveryRadius: number;
    isDeliveryAvailable: boolean;
    pickupAvailable: boolean;
    lastUpdated?: Date;
}

export interface ISharedCashierRegistry {
    maxFloatLimit: number;
    allowSuspension: boolean;
    requireManagerApprovalForVoid: boolean;
    defaultCashRegisterId?: string;
}
