import { Router } from "express";

;
import orderRoutes from "../../../modules/sales/order/order.routes.js";
import { productRoutes } from "@app/modules/catalog/product/product-core/product-core-routes.js";
import { UploadRoutes } from "@app/modules/common/upload/upload.routes.js";
import { customerRoutes } from "../../../modules/customer/customer.routes.js";
import { userRoutes } from "../../../modules/iam/user/user.routes.js";

import { roleRoutes } from "../../../modules/iam/role/role.routes.js";

import { permissionRoutes } from "../../../modules/iam/permission/permission.routes.js";
import { businessUnitRoutes } from "@app/modules/organization/business-unit/business-unit.routes.ts";
import { OutletRoutes } from "@app/modules/organization/outlet/outlet.route.ts";
import { PermissionGroupRoutes } from "../../../modules/iam/permission-group/permission-group.routes.js";

// Catalog Imports
import { categoryRoutes } from "@app/modules/catalog/category/category.routes.js";
import { subCategoryRoutes } from "@app/modules/catalog/sub-category/sub-category.routes.js";
import { childCategoryRoutes } from "@app/modules/catalog/child-category/child-category.routes.js";
import { BrandRoutes } from "@app/modules/catalog/brand/brand.routes.js";
import { UnitRoutes } from "@app/modules/catalog/unit/unit.routes.js";
import { TaxRoutes } from "@app/modules/catalog/tax/tax.routes.ts";
import { attributeRoutes } from "@app/modules/catalog/attribute/attribute.routes.js";
import { AttributeGroupRoutes } from "@app/modules/catalog/attribute-group/attribute-group.route.js";
import { SystemSettingsRoutes } from "@app/modules/settings/system-settings/system-settings.routes.js";
import { BusinessUnitSettingsRoutes } from "@app/modules/organization/business-unit-setting/business-unit-settings.routes.js";
import { storefrontRoutes } from "@app/modules/storefront/storefront.routes.ts";
import { ProductReviewRoutes } from "@app/modules/catalog/product/product-reviews/product-reviews.routes.js";
import { ProductQARoutes } from "@app/modules/catalog/product/product-questions/product-questions.routes.js";

// ... (existing imports) ...

// ... (existing imports) ...
// Inventory & Supplier Imports
import { SupplierRoutes } from "@app/modules/suppliers/supplier/supplier.routes.js";
import { PurchaseRoutes } from "@app/modules/purchase/purchase.routes.js";
import { InventoryRoutes } from "@app/modules/inventory/inventory.routes.js";
import { ExpenseRoutes } from "@app/modules/cash/expense/expense.routes.js";
import { ExpenseCategoryRoutes } from "@app/modules/cash/expense/expense-category.routes.js";
import { CashRegisterRoutes } from "@app/modules/cash/cash-register/cash-register.routes.js";
import { SalesReportRoutes } from "@app/modules/reports/sales-report/sales-report.routes.js";
import { PurchaseReportRoutes } from "@app/modules/reports/purchase-report/purchase-report.routes.js";
import { StockReportRoutes } from "@app/modules/reports/stock-report/stock-report.routes.js";
import { ProfitLossRoutes } from "@app/modules/reports/profit-loss/profit-loss.routes.js";
import { marketingRoutes } from "@app/modules/marketing/marketing.router.ts";
import { automationRoutes } from "@app/modules/automation/automation.router.ts";

import { logisticsRoutes } from "../../../modules/logistics/logistics.router.ts";
import { riskRoutes } from "../../../modules/risk/risk.router.ts";
import moduleGuard from "@app/middlewares/moduleGuard.ts"; // Optimized Guard Import

const superAdminRoutes = Router();

// --- ERP CORE ---
superAdminRoutes.use("/products", moduleGuard('erp'), productRoutes);
superAdminRoutes.use("/orders", moduleGuard('erp'), orderRoutes);
superAdminRoutes.use("/categories/sub", moduleGuard('erp'), subCategoryRoutes);
superAdminRoutes.use("/categories/child", moduleGuard('erp'), childCategoryRoutes);
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