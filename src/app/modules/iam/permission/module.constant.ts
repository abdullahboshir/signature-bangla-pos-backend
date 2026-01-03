import { PermissionSourceObj } from "./permission.constant.ts";

/**
 * Maps System Modules to specific Resources.
 * This is used to ENFORCE module-level access.
 * If a module is disabled (e.g. activeModules.erp = false), 
 * then access to these resources will be blocked even if the user has permission.
 */
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
        PermissionSourceObj.promotion,
        PermissionSourceObj.coupon,
        PermissionSourceObj.adCampaign,
        PermissionSourceObj.affiliate,
        PermissionSourceObj.content,
        PermissionSourceObj.landingPage,
        PermissionSourceObj.subscription,
    ],

    // CRM & Support
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
    ],

    // Logistics
    logistics: [
        PermissionSourceObj.shipping,
        PermissionSourceObj.delivery,
        PermissionSourceObj.courier,
        PermissionSourceObj.track,
        PermissionSourceObj.dispatch,
        PermissionSourceObj.parcel,
        PermissionSourceObj.zone,
    ],
} as const;

/**
 * Reverse Lookup: Resource -> Module Name
 * Example: 'inventory' -> 'erp'
 */
export const getModuleByResource = (resource: string): string | null => {
    for (const [moduleName, resources] of Object.entries(MODULE_RESOURCE_MAP)) {
        if ((resources as readonly string[]).includes(resource)) {
            return moduleName;
        }
    }
    return null; // Resource is core/shared (like 'user', 'role', 'report')
};
