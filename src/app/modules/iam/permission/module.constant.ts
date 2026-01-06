import { PermissionSourceObj } from "./permission.constant.ts";

export const MODULE_RESOURCE_MAP = {
    // POS System
    pos: [
        PermissionSourceObj.storefront,
        PermissionSourceObj.terminal,
        PermissionSourceObj.cashRegister,
        PermissionSourceObj.cart,
        PermissionSourceObj.wishlist,
        PermissionSourceObj.abandonedCart,
    ],

    // ERP Core (Catalog, Sales, Finance, Inventory)
    erp: [
        // Catalog
        PermissionSourceObj.product,
        PermissionSourceObj.category,
        PermissionSourceObj.brand,
        PermissionSourceObj.attribute,
        PermissionSourceObj.attributeGroup,
        PermissionSourceObj.unit,
        PermissionSourceObj.tax,

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

        // Risk
        PermissionSourceObj.fraudDetection,
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
        PermissionSourceObj.subscription,
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
        PermissionSourceObj.emailTemplate,
        PermissionSourceObj.smsTemplate,
        // Moved from E-Commerce
        PermissionSourceObj.promotion,
        PermissionSourceObj.coupon,
        PermissionSourceObj.adCampaign,
        PermissionSourceObj.affiliate,
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
        PermissionSourceObj.webhook,
        PermissionSourceObj.apiKey,
    ],

    // SaaS Platform
    saas: [
        PermissionSourceObj.license,
    ],
} as const;


export const getModuleByResource = (resource: string): string | null => {
    for (const [moduleName, resources] of Object.entries(MODULE_RESOURCE_MAP)) {
        if ((resources as readonly string[]).includes(resource)) {
            return moduleName;
        }
    }
    return null;
};
