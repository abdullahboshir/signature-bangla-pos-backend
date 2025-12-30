import { Router } from "express";

;
import orderRoutes from "../../../modules/commerce/sales/order/order.routes.js";
import { productRoutes } from "@app/modules/commerce/catalog/product/product-core/product-core-routes.js";
import { UploadRoutes } from "@app/modules/platform/common/upload/upload.routes.js";

import { userRoutes } from "../../../modules/iam/user/user.routes.js";

import { roleRoutes } from "../../../modules/iam/role/role.routes.js";

import { permissionRoutes } from "../../../modules/iam/permission/permission.routes.js";
import { businessUnitRoutes } from "@app/modules/platform/organization/business-unit/business-unit.routes.ts";
import { OutletRoutes } from "@app/modules/platform/organization/outlet/outlet.route.ts";
import { PermissionGroupRoutes } from "../../../modules/iam/permission-group/permission-group.routes.js";

// Catalog Imports
import { categoryRoutes } from "@app/modules/commerce/catalog/category/category.routes.js";
import { BrandRoutes } from "@app/modules/commerce/catalog/brand/brand.routes.js";
import { UnitRoutes } from "@app/modules/commerce/catalog/unit/unit.routes.js";
import { TaxRoutes } from "@app/modules/commerce/catalog/tax/tax.routes.ts";
import { attributeRoutes } from "@app/modules/commerce/catalog/attribute/attribute.routes.js";
import { AttributeGroupRoutes } from "@app/modules/commerce/catalog/attribute-group/attribute-group.route.js";
import { SystemSettingsRoutes } from "@app/modules/platform/settings/system-settings/system-settings.routes.js";
import { BusinessUnitSettingsRoutes } from "@app/modules/platform/organization/business-unit-setting/business-unit-settings.routes.js";
import { storefrontRoutes } from "@app/modules/commerce/storefront/storefront.routes.ts";
import { ProductReviewRoutes } from "@app/modules/commerce/catalog/product/product-reviews/product-reviews.routes.js";
import { ProductQARoutes } from "@app/modules/commerce/catalog/product/product-questions/product-questions.routes.js";

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
import { marketingRoutes } from "@app/modules/marketing/marketing.router.ts";
import { automationRoutes } from "@app/modules/platform/automation/automation.router.ts";

import { logisticsRoutes } from "../../../modules/erp/logistics/logistics.router.ts";
import { riskRoutes } from "../../../modules/commerce/risk/risk.router.ts";
import moduleGuard from "@app/middlewares/moduleGuard.ts"; // Optimized Guard Import
import { customerRoutes } from "@app/modules/contacts/customers/customer.routes.ts";

const superAdminRoutes = Router();

// --- ERP CORE ---
superAdminRoutes.use("/products", moduleGuard('erp'), productRoutes);
superAdminRoutes.use("/orders", moduleGuard('erp'), orderRoutes);
superAdminRoutes.use("/categories", moduleGuard('erp'), categoryRoutes);
superAdminRoutes.use("/brands", moduleGuard('erp'), BrandRoutes);
superAdminRoutes.use("/units", moduleGuard('erp'), UnitRoutes);
superAdminRoutes.use("/taxes", moduleGuard('erp'), TaxRoutes);
superAdminRoutes.use("/attributes", moduleGuard('erp'), attributeRoutes);
superAdminRoutes.use("/attribute-groups", moduleGuard('erp'), AttributeGroupRoutes);
superAdminRoutes.use("/suppliers", moduleGuard('erp'), SupplierRoutes);
superAdminRoutes.use("/purchases", moduleGuard('erp'), PurchaseRoutes);
superAdminRoutes.use("/inventory", moduleGuard('erp'), InventoryRoutes);
superAdminRoutes.use("/expenses", moduleGuard('erp'), ExpenseRoutes);
superAdminRoutes.use("/expense-categories", moduleGuard('erp'), ExpenseCategoryRoutes);
superAdminRoutes.use("/cash-registers", moduleGuard('erp'), CashRegisterRoutes); // Cash/Finance is usually ERP
superAdminRoutes.use("/reports/sales", moduleGuard('erp'), SalesReportRoutes);
superAdminRoutes.use("/reports/purchases", moduleGuard('erp'), PurchaseReportRoutes);
superAdminRoutes.use("/reports/stock", moduleGuard('erp'), StockReportRoutes);
superAdminRoutes.use("/reports/profit-loss", moduleGuard('erp'), ProfitLossRoutes);

// --- CRM ---
superAdminRoutes.use("/customers", moduleGuard('crm'), customerRoutes);
superAdminRoutes.use("/marketing", moduleGuard('crm'), marketingRoutes);
superAdminRoutes.use("/automation", moduleGuard('crm'), automationRoutes);

// --- E-COMMERCE ---
superAdminRoutes.use("/storefront", moduleGuard('ecommerce'), storefrontRoutes);
superAdminRoutes.use("/product-questions", moduleGuard('ecommerce'), ProductQARoutes); // Usually ecommerce feature
superAdminRoutes.use("/reviews", moduleGuard('ecommerce'), ProductReviewRoutes); // Usually ecommerce feature

// --- LOGISTICS ---
superAdminRoutes.use("/risk", moduleGuard('logistics'), riskRoutes);
superAdminRoutes.use("/logistics", moduleGuard('logistics'), logisticsRoutes);

// --- CORE SYSTEM (Unguarded) ---
superAdminRoutes.use("/upload", UploadRoutes);
superAdminRoutes.use("/users", userRoutes); // Staff/User Management (Core)
superAdminRoutes.use("/role", roleRoutes);
superAdminRoutes.use("/permission", permissionRoutes);
superAdminRoutes.use("/business-unit", businessUnitRoutes);
superAdminRoutes.use("/outlets", OutletRoutes);
superAdminRoutes.use("/settings", BusinessUnitSettingsRoutes);
superAdminRoutes.use("/system-settings", SystemSettingsRoutes);
superAdminRoutes.use("/permission-groups", PermissionGroupRoutes);


export const adminGroupRoutes = superAdminRoutes;