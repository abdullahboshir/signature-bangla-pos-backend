/* ------------------------------------------------------------------
 * 1️⃣ RESOURCE TYPES (Source of Truth)
 * ------------------------------------------------------------------ */

export const PermissionResourceType = [
    // Core Commerce
    "product",
    "category",
    "brand",
    "variant",
    "attribute",
    "attributeGroup",
    "unit",
    "tax",
    "warranty",

    // Sales & Orders
    "order",
    "quotation",
    "invoice",
    "return",
    "review",
    "coupon",
    "promotion",
    "abandonedCart",
    "content",

    // Customers & Users
    "customer",
    "user",
    "role",
    "permission",
    "auth",
    "wishlist",
    "cart",

    // Inventory & Supply
    "inventory",
    "warehouse",
    "purchase",
    "supplier",
    "vendor",
    "adjustment",
    "transfer",

    // Outlet / POS
    "outlet",
    "storefront",
    "terminal",
    "cashRegister",

    // Finance
    "payment",
    "expense",
    "expenseCategory",

    // System & Platform (New)
    "businessUnit",
    "systemConfig",
    "platformSetting",
    "companySetting",
    "businessSetting",
    "outletSetting",
    "backup",
    "auditLog",
    "apiKey",
    "webhook",
    "theme",
    "plugin",
    "language",
    "currency",
    "blacklist",
    "feature",
    "integration",
    "budget",
    "account",
    "transaction",
    "settlement",
    "payout",
    "reconciliation",


    // Logistics
    "shipping",
    "courier",
    "delivery",
    "parcel",
    "driver",
    "vehicle",
    "track",
    "dispatch",
    "zone",

    // Reports & Analytics
    "report",
    "analyticsReport",
    "salesReport",
    "purchaseReport",
    "stockReport",
    "profitLossReport",
    "dashboard",

    // HRM & Payroll
    "staff",
    "attendance",
    "leave",
    "payroll",
    "department",
    "designation",
    "asset",

    // Marketing & Growth
    "affiliate",
    "adCampaign",
    "loyalty",
    "subscription",
    "audience",
    "pixel",
    "event",
    "landingPage",
    "seo",
    "question",

    // Communication & Support
    "notification",
    "chat",
    "emailTemplate",
    "smsTemplate",
    "ticket",
    "dispute",

    // Automation & Risk
    "automation",
    "workflow",
    "fraudDetection",
    "riskRule",
    "riskProfile",

    // Governance & Compliance
    "shareholder",
    "meeting",
    "voting",
    "compliance",
    "license",
    "global",
] as const;


/* ------------------------------------------------------------------
 * 1️⃣.5️⃣ MODULE TYPES
 * ------------------------------------------------------------------ */

export const PermissionModule = [
    "iam",
    "platform",
    "ecommerce",
    "erp",
    "pos",
    "hrm",
    "crm",
    "logistics",
    "governance",
    "integrations",
    "saas",
    "system",
] as const;

/* ------------------------------------------------------------------
 * 2️⃣ ACTION TYPES
 * ------------------------------------------------------------------ */

export const PermissionActionType = [
    "create",
    "read",
    "update",
    "delete",
    "approve",
    "reject",
    "manage",
    "view",
    "assign",
    "publish",
    "unpublish",
    "cancel",
    "verify",
    "export",
    "import",
    "download",
    "print",
    "ship",
    "dispatch",
    "deliver",
    "refund",
    "track",
    "sync",
    "schedule",
    "reply",
    "block",
    "restrict",
    "adjust",
    "escalate",
] as const;

/* ------------------------------------------------------------------
 * 3️⃣ SCOPES
 * ------------------------------------------------------------------ */

export const PermissionScope = [
    "global",
    "company",
    "business",
    "vendor",
    "outlet",
    "branch",
    "warehouse",
    "department",
    "team",
    "category",
    "region",
    "channel",
    "segment",
    "self",
    "ip",
    "device",
] as const;

export const PermissionEffect = ["allow", "deny"] as const;

export const PermissionResolveStrategy = [
    "first-match",
    "most-specific",
    "priority-based",
    "cumulative",
] as const;

export const PermissionConditionOperator = [
    "eq",
    "neq",
    "gt",
    "gte",
    "lt",
    "lte",
    "in",
    "not-in",
    "contains",
    "starts-with",
    "ends-with",
    "between",
    "regex",
    "like",
] as const;



/**
 * 🔒 SENSITIVE ACTIONS (Require extra audit or high-level roles)
 * Conceptually grouped for backend guards and risk assessment.
 */
export const SensitiveActions = [
    "approve",
    "reject",
    "refund",
    "block",
    "restrict",
    "escalate",
    "delete", // Usually sensitive in ERP
] as const;
