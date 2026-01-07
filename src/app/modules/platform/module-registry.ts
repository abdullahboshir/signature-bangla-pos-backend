import { PermissionSourceObj } from "../iam/permission/permission.constant.js";

/**
 * Module Capability Registry
 * Defines the public-facing capabilities and dependencies of each system module.
 */

export interface IModuleCapability {
    id: string;
    name: string;
    provides: string[];      // Features provided by this module
    requires?: string[];    // Mandatory module dependencies
    optional?: string[];    // Optional integration modules
    standalone: boolean;    // Can it function without any other business module?
}

export const MODULE_REGISTRY: Record<string, IModuleCapability> = {
    iam: {
        id: 'iam',
        name: 'Identity & Access Management',
        provides: [
            PermissionSourceObj.auth,
            PermissionSourceObj.user,
            PermissionSourceObj.role,
            PermissionSourceObj.permission
        ],
        standalone: true
    },
    platform: {
        id: 'platform',
        name: 'Platform Infrastructure',
        provides: [
            PermissionSourceObj.businessUnit,
            PermissionSourceObj.setting,
            PermissionSourceObj.auditLog,
            PermissionSourceObj.backup
        ],
        standalone: true
    },
    ecommerce: {
        id: 'ecommerce',
        name: 'E-Commerce Storefront',
        provides: [
            PermissionSourceObj.theme,
            PermissionSourceObj.plugin,
            PermissionSourceObj.seo,
            PermissionSourceObj.content,
            PermissionSourceObj.landingPage,
            PermissionSourceObj.subscription,
            PermissionSourceObj.review
        ],
        requires: ['platform', 'iam'],
        standalone: false
    },
    erp: {
        id: 'erp',
        name: 'Enterprise Resource Planning',
        provides: [
            PermissionSourceObj.product,
            PermissionSourceObj.category,
            PermissionSourceObj.brand,
            PermissionSourceObj.attribute,
            PermissionSourceObj.attributeGroup,
            PermissionSourceObj.unit,
            PermissionSourceObj.tax, // Catalog
            PermissionSourceObj.order,
            PermissionSourceObj.invoice,
            PermissionSourceObj.quotation,
            PermissionSourceObj.return, // Sales
            PermissionSourceObj.account,
            PermissionSourceObj.transaction,
            PermissionSourceObj.payment,
            PermissionSourceObj.budget,
            PermissionSourceObj.expense,
            PermissionSourceObj.expenseCategory,
            PermissionSourceObj.settlement,
            PermissionSourceObj.payout,
            PermissionSourceObj.reconciliation, // Finance
            PermissionSourceObj.inventory,
            PermissionSourceObj.purchase,
            PermissionSourceObj.supplier,
            PermissionSourceObj.vendor,
            PermissionSourceObj.adjustment,
            PermissionSourceObj.transfer,
            PermissionSourceObj.warehouse, // Supply Chain
            PermissionSourceObj.salesReport,
            PermissionSourceObj.purchaseReport,
            PermissionSourceObj.stockReport,
            PermissionSourceObj.profitLossReport, // Analytics
            PermissionSourceObj.fraudDetection // Risk
        ],
        requires: ['platform', 'iam', 'contacts'],
        standalone: true
    },
    pos: {
        id: 'pos',
        name: 'Point of Sale',
        provides: [
            PermissionSourceObj.storefront,
            PermissionSourceObj.terminal,
            PermissionSourceObj.cashRegister,
            PermissionSourceObj.cart,
            PermissionSourceObj.wishlist,
            PermissionSourceObj.abandonedCart
        ],
        requires: ['platform', 'iam'],
        optional: ['erp', 'ecommerce'],
        standalone: true
    },
    hrm: {
        id: 'hrm',
        name: 'Human Resource Management',
        provides: [
            PermissionSourceObj.staff,
            PermissionSourceObj.department,
            PermissionSourceObj.designation,
            PermissionSourceObj.attendance,
            PermissionSourceObj.leave,
            PermissionSourceObj.payroll,
            PermissionSourceObj.asset
        ],
        requires: ['platform', 'iam'],
        standalone: true
    },
    crm: {
        id: 'crm',
        name: 'CRM & Marketing',
        provides: [
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
            PermissionSourceObj.promotion,
            PermissionSourceObj.coupon,
            PermissionSourceObj.adCampaign,
            PermissionSourceObj.affiliate
        ],
        requires: ['platform', 'iam'],
        standalone: true
    },
    logistics: {
        id: 'logistics',
        name: 'Logistics & Delivery',
        provides: [
            PermissionSourceObj.shipping,
            PermissionSourceObj.delivery,
            PermissionSourceObj.courier,
            PermissionSourceObj.track,
            PermissionSourceObj.dispatch,
            PermissionSourceObj.parcel,
            PermissionSourceObj.zone,
            PermissionSourceObj.driver,
            PermissionSourceObj.vehicle
        ],
        requires: ['platform', 'iam', 'erp'],
        standalone: false
    },
    governance: {
        id: 'governance',
        name: 'Corporate Governance',
        provides: [
            PermissionSourceObj.shareholder,
            PermissionSourceObj.voting,
            PermissionSourceObj.meeting,
            PermissionSourceObj.compliance
        ],
        requires: ['platform', 'iam'],
        standalone: true
    },
    integrations: {
        id: 'integrations',
        name: 'System Integrations',
        provides: [
            PermissionSourceObj.integration,
            PermissionSourceObj.webhook,
            PermissionSourceObj.apiKey
        ],
        requires: ['platform', 'iam'],
        standalone: false
    },
    saas: {
        id: 'saas',
        name: 'SaaS Platform Management',
        provides: [
            PermissionSourceObj.license,
            PermissionSourceObj.feature
        ],
        requires: ['platform', 'iam'],
        standalone: false
    }
};
