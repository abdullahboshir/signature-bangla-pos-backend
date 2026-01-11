import { PermissionSourceObj } from "./permission.resource.js";

export const MODULE_RESOURCE_MAP = {
    // IAM System
    iam: [
        PermissionSourceObj.auth,
        PermissionSourceObj.user,
        PermissionSourceObj.role,
        PermissionSourceObj.permission,
    ],

    // POS System
    pos: [
        PermissionSourceObj.storefront,
        PermissionSourceObj.terminal,
        PermissionSourceObj.cashRegister,
        PermissionSourceObj.cart,
        PermissionSourceObj.wishlist,
        PermissionSourceObj.abandonedCart,
        PermissionSourceObj.outlet,
    ],

    // ERP Core (Catalog, Sales, Finance, Inventory)
    erp: [
        // Catalog
        PermissionSourceObj.product,
        PermissionSourceObj.category,
        PermissionSourceObj.brand,
        PermissionSourceObj.attribute,
        PermissionSourceObj.attributeGroup,
        PermissionSourceObj.variant,
        PermissionSourceObj.unit,
        PermissionSourceObj.tax,
        PermissionSourceObj.warranty,

        // Sales & Billing
        PermissionSourceObj.order,
        PermissionSourceObj.invoice,
        PermissionSourceObj.quotation,
        PermissionSourceObj.return,

        // Finance & Accounts
        PermissionSourceObj.account,
        PermissionSourceObj.transaction,
        PermissionSourceObj.payment,
        PermissionSourceObj.budget,
        PermissionSourceObj.expense,
        PermissionSourceObj.expenseCategory,
        PermissionSourceObj.settlement,
        PermissionSourceObj.payout,
        PermissionSourceObj.reconciliation,

        // Inventory & Supply Chain
        PermissionSourceObj.inventory,
        PermissionSourceObj.purchase,
        PermissionSourceObj.supplier,
        PermissionSourceObj.vendor,
        PermissionSourceObj.adjustment,
        PermissionSourceObj.transfer,
        PermissionSourceObj.warehouse,

        // Reports (Module Specific)
        PermissionSourceObj.salesReport,
        PermissionSourceObj.purchaseReport,
        PermissionSourceObj.stockReport,
        PermissionSourceObj.profitLossReport,

        // Logistics (Merged into ERP)
        PermissionSourceObj.shipping,
        PermissionSourceObj.delivery,
        PermissionSourceObj.courier,
        PermissionSourceObj.track,
        PermissionSourceObj.dispatch,
        PermissionSourceObj.parcel,
        PermissionSourceObj.zone,
        PermissionSourceObj.driver,
        PermissionSourceObj.vehicle,

        // Risk & Automation
        PermissionSourceObj.fraudDetection,
        PermissionSourceObj.riskRule,
        PermissionSourceObj.riskProfile,
        PermissionSourceObj.automation,
        PermissionSourceObj.workflow,

        // Missing Items Added
        PermissionSourceObj.analyticsReport,
    ],

    // HRM & Payroll
    hrm: [
        PermissionSourceObj.staff,
        PermissionSourceObj.department,
        PermissionSourceObj.designation,
        PermissionSourceObj.attendance,
        PermissionSourceObj.leave,
        PermissionSourceObj.payroll,
        PermissionSourceObj.asset,
    ],

    // E-Commerce
    ecommerce: [
        PermissionSourceObj.theme,
        PermissionSourceObj.plugin,
        PermissionSourceObj.seo,
        PermissionSourceObj.review,
        PermissionSourceObj.content,
        PermissionSourceObj.landingPage,
        PermissionSourceObj.question,
    ],

    // CRM & Marketing (Consolidated)
    crm: [
        PermissionSourceObj.customer,
        PermissionSourceObj.ticket,
        PermissionSourceObj.chat,
        PermissionSourceObj.dispute,
        PermissionSourceObj.audience,
        PermissionSourceObj.pixel,
        PermissionSourceObj.event,
        PermissionSourceObj.loyalty,
        // Moved to system for infrastructure orchestration
        // Moved from E-Commerce
        PermissionSourceObj.promotion,
        PermissionSourceObj.coupon,
        PermissionSourceObj.adCampaign,
        PermissionSourceObj.affiliate,
        PermissionSourceObj.notification, // Added from system/missing
        PermissionSourceObj.emailTemplate, // Added from system/missing
        PermissionSourceObj.smsTemplate, // Added from system/missing
    ],

    // Governance & Compliance
    governance: [
        PermissionSourceObj.shareholder,
        PermissionSourceObj.voting,
        PermissionSourceObj.meeting,
        PermissionSourceObj.compliance,
    ],

    // Integrations
    integrations: [
        PermissionSourceObj.integration,
        PermissionSourceObj.webhook,
        PermissionSourceObj.apiKey,
    ],

    // Infrastructure & Configuration
    system: [
        PermissionSourceObj.systemConfig,
        PermissionSourceObj.companySetting,
        PermissionSourceObj.businessSetting,
        PermissionSourceObj.outletSetting,
        PermissionSourceObj.backup,
        PermissionSourceObj.auditLog,
        PermissionSourceObj.language,
        PermissionSourceObj.currency,
        PermissionSourceObj.blacklist,
        PermissionSourceObj.notification,
        PermissionSourceObj.global,
        PermissionSourceObj.dashboard,
        PermissionSourceObj.report,
        PermissionSourceObj.analyticsReport,
        PermissionSourceObj.emailTemplate,
        PermissionSourceObj.smsTemplate,
    ],

    // SaaS & Platform
    saas: [
        PermissionSourceObj.subscription,
        PermissionSourceObj.license,
        PermissionSourceObj.feature,
    ],

    platform: [
        PermissionSourceObj.businessUnit,
        PermissionSourceObj.platformSetting,
    ],
} as const;


export const getModuleByResource = (resource: string): string | null => {
    // console.log(`[DEBUG] Looking up module for resource: ${resource}`);
    for (const [moduleName, resources] of Object.entries(MODULE_RESOURCE_MAP)) {
        if ((resources as readonly string[]).includes(resource)) {
            return moduleName;
        }
    }
    // console.warn(`[DEBUG] No module found for resource: ${resource}`);
    return null;
};
