import { Router } from "express";
import requireModule from "@core/middleware/license.middleware.ts";

;
import orderRoutes from "../../../modules/commerce/sales/order/order.routes.js";
import { productRoutes } from "@app/modules/catalog/product/domain/product-core/product.routes.ts";
import { UploadRoutes } from "@app/modules/platform/common/upload/upload.routes.js";

import { userRoutes } from "../../../modules/iam/user/user.routes.js";

import { roleRoutes } from "../../../modules/iam/role/role.routes.js";

import { permissionRoutes } from "../../../modules/iam/permission/permission.routes.js";
import { businessUnitRoutes } from "@app/modules/platform/organization/business-unit/core/business-unit.routes.ts";
import { OutletRoutes } from "@app/modules/platform/organization/outlet/outlet.routes.js";
import { PermissionGroupRoutes } from "../../../modules/iam/permission-group/permission-group.routes.js";
import { dashboardRoutes } from "./dashboard.routes.ts";

// Catalog Imports
import { categoryRoutes } from "@app/modules/catalog/category/category.routes.ts";
import { BrandRoutes } from "@app/modules/catalog/brand/brand.routes.ts";
import { UnitRoutes } from "@app/modules/catalog/unit/unit.routes.ts";
import { TaxRoutes } from "@app/modules/catalog/tax/tax.routes.ts";
import { attributeRoutes } from "@app/modules/catalog/attribute/attribute.routes.ts";
import { AttributeGroupRoutes } from "@app/modules/catalog/attribute-group/attribute-group.routes.ts";
import { WarrantyRoutes } from "@app/modules/catalog/warranty/warranty.routes.ts";
import { SystemSettingsRoutes } from "@app/modules/platform/settings/system-settings/system-settings.routes.js";
import { PlatformSettingsRoutes } from "@app/modules/platform/settings/platform-settings/platform-settings.routes.js";
import { BusinessUnitSettingsRoutes } from "@app/modules/platform/organization/business-unit/settings/settings.routes.js";
import { storefrontRoutes } from "@app/modules/commerce/storefront/storefront.routes.ts";
import { ProductReviewRoutes } from "@app/modules/commerce/storefront/product-feedback/product-reviews.routes.ts";
import { ProductQARoutes } from "@app/modules/commerce/storefront/product-feedback/product-questions.routes.ts";

// ... (existing imports) ...

// ... (existing imports) ...
// Inventory & Supplier Imports
import { SupplierRoutes } from "@app/modules/erp/suppliers/supplier/supplier.routes.js";
import { PurchaseRoutes } from "@app/modules/erp/purchase/purchase.routes.js";
import { InventoryRoutes } from "@app/modules/erp/inventory/inventory.routes.js";
import { ExpenseRoutes } from "@app/modules/pos/cash/expense/expense.routes.js";
import { ExpenseCategoryRoutes } from "@app/modules/pos/cash/expense/expense-category.routes.js";
import { CashRegisterRoutes } from "@app/modules/pos/cash/cash-register/cash-register.routes.js";
import { SalesReportRoutes } from "@app/modules/erp/reports/sales-report/sales-report.routes.js";
import { PurchaseReportRoutes } from "@app/modules/erp/reports/purchase-report/purchase-report.routes.js";
import { StockReportRoutes } from "@app/modules/erp/reports/stock-report/stock-report.routes.js";
import { ProfitLossRoutes } from "@app/modules/erp/reports/profit-loss/profit-loss.routes.js";
import { marketingRoutes } from "@app/modules/marketing/core/marketing.routes.js";
import { automationRoutes } from "@app/modules/platform/automation/automation.routes.js";
// ERP & Commerce
import { logisticsRoutes } from "../../../modules/erp/logistics/logistics.routes.js";
import { riskRoutes } from "../../../modules/commerce/risk/risk.routes.js";
import moduleGuard from "@app/middlewares/moduleGuard.ts"; // Optimized Guard Import
import { customerRoutes } from "@app/modules/contacts/customers/customer.routes.ts";

// HRM Imports
import { AttendanceRoutes } from "@app/modules/hrm/attendance/attendance.routes.js";
import { LeaveRoutes } from "@app/modules/hrm/leave/leave.routes.js";
import { PayrollRoutes } from "@app/modules/hrm/payroll/payroll.routes.js";
import { DepartmentRoutes } from "@app/modules/hrm/department/department.routes.js";
import { DesignationRoutes } from "@app/modules/hrm/designation/designation.routes.js";
import { AssetRoutes } from "@app/modules/hrm/asset/asset.routes.js";

// Accounting Imports
import { AccountRoutes } from "@app/modules/erp/accounting/accounts/accounts.routes.js";
import { TransactionRoutes } from "@app/modules/erp/accounting/transactions/transaction.routes.js";
import { BudgetRoutes } from "@app/modules/erp/accounting/budgets/budget.routes.js";

// Storefront Advanced Imports
import { ThemeRoutes } from "@app/modules/commerce/storefront/themes/theme.routes.js";
import { PluginRoutes } from "@app/modules/commerce/storefront/plugins/plugin.routes.js";
import { LandingPageRoutes } from "@app/modules/commerce/storefront/landing-pages/landing-page.routes.js";
import { AbandonedCartRoutes } from "@app/modules/commerce/storefront/abandoned-carts/abandoned-cart.routes.js";

// Marketing Advanced Imports
import { SEORoutes } from "@app/modules/marketing/seo/seo.routes.js";
import { AffiliateRoutes } from "@app/modules/marketing/affiliates/affiliate.routes.js";
import { EventRoutes } from "@app/modules/marketing/events/event.routes.js";
import { PixelRoutes } from "@app/modules/marketing/pixels/pixel.routes.js";

// Finance Imports
import { ReconciliationRoutes } from "@app/modules/platform/finance/reconciliation/reconciliation.routes.js";
import { PayoutRoutes } from "@app/modules/platform/finance/payouts/payout.routes.js";
import { SettlementRoutes } from "@app/modules/platform/finance/settlements/settlement.routes.js";

// System Imports
import { AuditLogRoutes } from "@app/modules/platform/system/audit-log/audit-log.routes.js";
import { BackupRoutes } from "@app/modules/platform/system/backup/backup.routes.js";
import { NotificationRoutes } from "@app/modules/platform/system/notification/notification.routes.js";
import { CurrencyRoutes } from "@app/modules/platform/system/currency/currency.routes.js";
import { LanguageRoutes } from "@app/modules/platform/system/language/language.routes.js";
import { ZoneRoutes } from "@app/modules/platform/system/zone/zone.routes.js";
import { APIKeyRoutes } from "@app/modules/platform/system/api-key/api-key.routes.js";
import { WebhookRoutes } from "@app/modules/platform/system/webhook/webhook.routes.js";
import { EmailTemplateRoutes } from "@app/modules/platform/system/email-template/email-template.routes.js";
import { SMSTemplateRoutes } from "@app/modules/platform/system/sms-template/sms-template.routes.js";

import { USER_ROLE } from "@app/modules/iam/user/user.constant.ts";

import contextGuard from "@app/middlewares/contextGuard.ts";
import auth from "@core/middleware/auth.ts";

const superAdminRoutes = Router();

// ========================================================================
// 🛡️ GLOBAL SECURITY LAYER: Centralized Authentication
// ========================================================================
// Every route under /super-admin now requires a valid token and authorized role.
// No more "Unguarded" routes.
superAdminRoutes.use(auth(
    USER_ROLE.SUPER_ADMIN,
    USER_ROLE.COMPANY_OWNER,
    USER_ROLE.ADMIN,
    USER_ROLE.MANAGER,
    'business-admin'
));

// --- ERP CORE (Licensed) ---
superAdminRoutes.use("/products", moduleGuard('erp'), requireModule('erp'), productRoutes);
superAdminRoutes.use("/orders", moduleGuard('erp'), requireModule('erp'), orderRoutes);
superAdminRoutes.use("/categories", moduleGuard('erp'), requireModule('erp'), categoryRoutes);
superAdminRoutes.use("/brands", moduleGuard('erp'), requireModule('erp'), BrandRoutes);
superAdminRoutes.use("/units", moduleGuard('erp'), requireModule('erp'), UnitRoutes);
superAdminRoutes.use("/taxes", moduleGuard('erp'), requireModule('erp'), TaxRoutes);
superAdminRoutes.use("/attributes", moduleGuard('erp'), requireModule('erp'), attributeRoutes);
superAdminRoutes.use("/attribute-groups", moduleGuard('erp'), requireModule('erp'), AttributeGroupRoutes);
superAdminRoutes.use("/warranties", moduleGuard('erp'), requireModule('erp'), WarrantyRoutes);
superAdminRoutes.use("/suppliers", moduleGuard('erp'), requireModule('erp'), SupplierRoutes);
superAdminRoutes.use("/purchases", moduleGuard('erp'), requireModule('erp'), PurchaseRoutes);
superAdminRoutes.use("/inventory", moduleGuard('erp'), requireModule('erp'), InventoryRoutes);
superAdminRoutes.use("/expenses", moduleGuard('erp'), requireModule('erp'), ExpenseRoutes);
superAdminRoutes.use("/expense-categories", moduleGuard('erp'), requireModule('erp'), ExpenseCategoryRoutes);
superAdminRoutes.use("/cash-registers", moduleGuard('erp'), requireModule('erp'), CashRegisterRoutes);
superAdminRoutes.use("/reports/sales", moduleGuard('erp'), requireModule('erp'), SalesReportRoutes);
superAdminRoutes.use("/reports/purchases", moduleGuard('erp'), requireModule('erp'), PurchaseReportRoutes);
superAdminRoutes.use("/reports/stock", moduleGuard('erp'), requireModule('erp'), StockReportRoutes);
superAdminRoutes.use("/reports/profit-loss", moduleGuard('erp'), requireModule('erp'), ProfitLossRoutes);

// --- CRM (Licensed) ---
superAdminRoutes.use("/customers", moduleGuard('crm'), requireModule('crm'), customerRoutes);
superAdminRoutes.use("/marketing", moduleGuard('crm'), requireModule('crm'), marketingRoutes);
superAdminRoutes.use("/automation", moduleGuard('crm'), requireModule('crm'), automationRoutes);

// --- E-COMMERCE (Licensed) ---
superAdminRoutes.use("/storefront", moduleGuard('ecommerce'), requireModule('ecommerce'), storefrontRoutes);
superAdminRoutes.use("/product-questions", moduleGuard('ecommerce'), requireModule('ecommerce'), ProductQARoutes);
superAdminRoutes.use("/reviews", moduleGuard('ecommerce'), requireModule('ecommerce'), ProductReviewRoutes);

// --- LOGISTICS (Licensed) ---
superAdminRoutes.use("/risk", moduleGuard('logistics'), requireModule('logistics'), riskRoutes);
superAdminRoutes.use("/logistics", moduleGuard('logistics'), requireModule('logistics'), logisticsRoutes);

// --- CORE SYSTEM (Context Guarded where ID is present) ---
superAdminRoutes.use("/upload", UploadRoutes);
superAdminRoutes.use("/users", userRoutes); // Staff/User Management (Core)
superAdminRoutes.use("/role", roleRoutes);
superAdminRoutes.use("/permission", permissionRoutes);
superAdminRoutes.use("/business-unit", contextGuard(), businessUnitRoutes); // SECURED: Validate businessUnitId
superAdminRoutes.use("/outlets", contextGuard(), OutletRoutes); // SECURED: Validate outletId
superAdminRoutes.use("/settings", contextGuard(), BusinessUnitSettingsRoutes); // SECURED: Validate businessUnitId
superAdminRoutes.use("/system-settings", SystemSettingsRoutes);
superAdminRoutes.use("/platform-settings", PlatformSettingsRoutes);
superAdminRoutes.use("/permission-groups", PermissionGroupRoutes);
superAdminRoutes.use("/dashboard", dashboardRoutes);

// --- HRM ---
superAdminRoutes.use("/hrm/attendance", moduleGuard('hrm'), AttendanceRoutes);
superAdminRoutes.use("/hrm/leave", moduleGuard('hrm'), LeaveRoutes);
superAdminRoutes.use("/hrm/payroll", moduleGuard('hrm'), PayrollRoutes);
superAdminRoutes.use("/hrm/departments", moduleGuard('hrm'), DepartmentRoutes);
superAdminRoutes.use("/hrm/designations", moduleGuard('hrm'), DesignationRoutes);
superAdminRoutes.use("/hrm/assets", moduleGuard('hrm'), AssetRoutes);

// --- ACCOUNTING ---
superAdminRoutes.use("/accounting/accounts", moduleGuard('erp'), AccountRoutes);
superAdminRoutes.use("/accounting/transactions", moduleGuard('erp'), TransactionRoutes);
superAdminRoutes.use("/accounting/budgets", moduleGuard('erp'), BudgetRoutes);

// --- STOREFRONT ADVANCED ---
superAdminRoutes.use("/storefront/themes", moduleGuard('ecommerce'), ThemeRoutes);
superAdminRoutes.use("/storefront/plugins", moduleGuard('ecommerce'), PluginRoutes);
superAdminRoutes.use("/storefront/landing-pages", moduleGuard('ecommerce'), LandingPageRoutes);
superAdminRoutes.use("/storefront/abandoned-carts", moduleGuard('ecommerce'), AbandonedCartRoutes);

// --- MARKETING ADVANCED ---
superAdminRoutes.use("/marketing/seo", moduleGuard('crm'), SEORoutes);
superAdminRoutes.use("/marketing/affiliates", moduleGuard('crm'), AffiliateRoutes);
superAdminRoutes.use("/marketing/events", moduleGuard('crm'), EventRoutes);
superAdminRoutes.use("/marketing/pixels", moduleGuard('crm'), PixelRoutes);

// --- FINANCE (Platform) ---
superAdminRoutes.use("/finance/reconciliation", ReconciliationRoutes);
superAdminRoutes.use("/finance/payouts", PayoutRoutes);
superAdminRoutes.use("/finance/settlements", SettlementRoutes);

// --- SYSTEM ---
superAdminRoutes.use("/system/audit-logs", AuditLogRoutes);
superAdminRoutes.use("/system/backups", BackupRoutes);
superAdminRoutes.use("/system/notifications", NotificationRoutes);
superAdminRoutes.use("/system/currencies", CurrencyRoutes);
superAdminRoutes.use("/system/languages", LanguageRoutes);
superAdminRoutes.use("/system/zones", ZoneRoutes);
superAdminRoutes.use("/system/api-keys", APIKeyRoutes);
superAdminRoutes.use("/system/webhooks", WebhookRoutes);
superAdminRoutes.use("/system/email-templates", EmailTemplateRoutes);
superAdminRoutes.use("/system/sms-templates", SMSTemplateRoutes);


export const adminGroupRoutes = superAdminRoutes;