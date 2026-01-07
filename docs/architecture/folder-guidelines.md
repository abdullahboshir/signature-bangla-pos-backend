# Folder Organization Guidelines

**Last Updated:** 2026-01-07  
**Purpose:** Maintain clean, navigable folder structure

---

## Core Principles

### 1. The 20-Child Rule
**If a folder has >20 direct children, consider breaking it down.**

**Why 20?**
- IDE performance
- Mental model capacity
- Navigation efficiency

---

## Current Audit Results

### ✅ Compliant Modules

#### `commerce/catalog/product/`
```
product/
├── domain/              ✅
├── features/            ✅ (9 subfolders)
├── product-shared/      ✅
├── search/              ✅
├── utils/               ✅
└── index.ts

Direct children: 6 ✅
```

**Status:** Well-organized with domain/features segregation

---

#### `platform/organization/`
```
organization/
├── business-unit/       ✅
├── company/             ✅
└── outlet/              ✅

Direct children: 3 ✅
```

**Status:** Clean hierarchy

---

#### `commerce/catalog/product/features/`
```
features/
├── product-analytics/
├── product-details/
├── product-inventory/
├── product-pricing/
├── product-questions/
├── product-reviews/
├── product-shipping/
├── product-variant/
└── product-warranty-return/

Direct children: 9 ✅
```

**Status:** Excellent feature breakdown

---

### ⚠️ Attention Needed

#### `platform/system/`
```
system/
├── api-key/
├── audit-log/
├── backup/
├── currency/
├── email-template/
├── language/
├── notification/
├── sms-template/
├── webhook/
├── zone/
└── notification-template.model.ts

Direct children: 11 ✅ (Close to limit)
```

**Status:** Acceptable but monitor growth  
**Recommendation:** If adding >9 more, create sub-categories (e.g., `templates/`, `integrations/`)

---

## Best Practices

### Grouping Strategies

#### By Feature
```
module/
├── feature-a/
├── feature-b/
└── feature-c/
```

#### By Layer (Domain-Driven)
```
module/
├── core/       (essential logic)
├── features/   (optional capabilities)
└── shared/     (common utilities)
```

**Example:** `commerce/catalog/product/`

---

#### By Entity Type
```
module/
├── models/
├── services/
└── controllers/
```

**Not Recommended:** Leads to fragmentation

---

### File Naming

#### ✅ Good
- `product-inventory.service.ts`
- `user-business-access.model.ts`

#### ❌ Bad
- `productInventory.service.ts` (camelCase not kebab-case)
- `user_business_access.model.ts` (snake_case not kebab-case)

---

### When to Break Down

#### Scenario 1: Too Many Files
```
Before (23 children):
analytics/
├── revenue.service.ts
├── customer.service.ts
├── product.service.ts
... (20 more)

After:
analytics/
├── financial/
│   └── revenue.service.ts
├── customer/
│   └── customer.service.ts
└── product/
    └── product.service.ts
```

---

#### Scenario 2: Mixed Responsibilities
```
Before:
reports/
├── sales-report.ts
├── purchase-report.ts
├── stock-report.ts
├── profit-loss.ts

After:
reports/
├── sales-report/      (with subdomain logic)
├── purchase-report/
├── stock-report/
└── profit-loss/
```

**Status in codebase:** ✅ Already done correctly

---

## Module-Specific Guidelines

### Commerce
- **Product features:** Keep in `features/` subdirectory
- **Catalog items:** Separate folders (category, brand, tax, unit)

### Platform
- **Organization:** Company → BusinessUnit → Outlet hierarchy
- **System:** Group by integration type when >15 children

### ERP
- **Reports:** Each report type = separate folder
- **Accounting:** Transactions vs. Accounts vs. Budgets

---

## Refactoring Checklist

When reorganizing:
- [ ] Document intent (why reorganizing)
- [ ] Use `git mv` to preserve history
- [ ] Update all imports
- [ ] Update barrel exports
- [ ] Run build to verify
- [ ] Update documentation

---

## Monitoring

### Regular Audits
Run quarterly folder audit:
```bash
find src/app/modules -mindepth 2 -maxdepth 2 -type d -exec sh -c 'echo "$(ls -1 {} | wc -l) {}"' \; | sort -nr
```

**Red flag:** >25 direct children  
**Yellow flag:** >20 direct children

---

## Related Documentation
- [Module Contracts](./module-contracts.md)
- [System Design](./system-design.md)
