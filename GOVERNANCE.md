# Architectural Governance & Project Laws

This document defines the strict architectural boundaries and development discipline for the Signature Bangla POS system. Any deviation from these rules must be justified and explicitly approved.

## 1. Module Ownership Matrix

| Module       | Core Responsibility                    | Ownership   | Access Level                         |
| :----------- | :------------------------------------- | :---------- | :----------------------------------- |
| **Catalog**  | Product Master Data, Categories, Units | ERP / Admin | READ-ONLY for POS/Commerce           |
| **ERP**      | Inventory, Purchase, Accounts, Logic   | ERP         | FULL (Write/Read)                    |
| **POS**      | Real-time Sales, Checkout, Receipts    | POS         | Transact (Write Order, Read Product) |
| **Commerce** | Online Storefront, Customer Interface  | Commerce    | Transact (Write Order, Read Product) |

> [!IMPORTANT] > **Primary Rule**: POS and Commerce modules **MUST NOT** modify Catalog data (e.g., changing product names or prices). All master data changes happen via the ERP/Admin interface.

## 2. Entity Lifecycle Definition

### Product / Category Lifecycle

- **Draft**: Initial entry, not visible to POS or Commerce.
- **Active**: Fully configured, synchronized with active modules.
- **Inactive**: Hidden from storefronts/sellers, but retained for historical reports.
- **Archived (Soft Delete)**: Product is marked `isDeleted: true`. System retains it for 30 days (Data Retention Policy) before deep deletion. **Never hard delete manually.**

## 3. The "No Hidden Dependency" Law

1. **Adapter Pattern Only**: Module A must never import a specific service or model from Module B. It must use the `ModuleAdapter` or a shared `Contract`.
   - ✅ `import { CatalogProductAdapter } from "@app/modules/catalog";`
   - ❌ `import { ProductService } from "@app/modules/catalog/product/product.service";`
2. **Barrel Consistency**: All cross-module imports must go through the module's main `index.ts` (Barrel).
3. **Internal vs Public**: Keep `*.model.ts` and `*.service.ts` private to the module unless they are part of a global maintenance suite.

## 4. Module Toggle vs Permission

- **Module Toggle**: Controls the **availability** of a feature set for a Business Unit (e.g., disabling E-Commerce for a small retail shop).
- **Permission (RBAC)**: Controls **actions** within an enabled module (e.g., a "Cashier" can sell but not "Edit Price").

## 5. Resilience & Degraded Mode

- **POS Independence**: Local caching should allow POS to function (read products/create orders) even if the ERP/Accounting sync is lagging.

## 6. Naming Conventions

- **Files**: Use `type.role.ts` (e.g., `product.model.ts`, `product.dto.ts`).
- **Folders**: Use singular for singular features (e.g., `src/app/modules/catalog/product`).
