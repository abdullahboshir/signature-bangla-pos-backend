# Settings Resolution System

**Last Updated:** 2026-01-07  
**Purpose:** Document the hierarchical settings resolution system

---

## Overview

Settings cascade from Platform (global) → Company → Business Unit → Outlet (specific).

### Resolution Order
```
1. Outlet Settings (Most Specific)
   ↓ (if not found)
2. Business Unit Settings
   ↓ (if not found)
3. Company Settings
   ↓ (if not found)
4. Platform Settings (Fallback/Default)
```

---

## Hierarchy Levels

### Level 1: Platform (System Defaults)
**Scope:** Entire system  
**File:** `platform/settings/system-settings/`

```typescript
{
  currency: "BDT",
  language: "en",
  timezone: "Asia/Dhaka",
  dateFormat: "DD/MM/YYYY"
}
```

**Use Cases:**
- New tenant onboarding
- System-wide defaults
- Regulatory requirements

---

### Level 2: Company
**Scope:** All business units under a company  
**File:** `platform/organization/company/settings/`

```typescript
{
  // Overrides platform
  currency: "USD",
  taxSettings: {
    vatRate: 15
  }
}
```

**Use Cases:**
- Multi-brand corporations
- Country-specific settings
- Corporate policies

---

### Level 3: Business Unit
**Scope:** Specific business/brand  
**File:** `platform/organization/business-unit/settings/`

```typescript
{
  // Overrides company
  pos: {
    enableCashDrawer: true,
    receiptFooter: "Thank you!"
  },
  commerce: {
    inventory: {
      lowStockAlert: true,
      thresholdQty: 10
    }
  }
}
```

**Use Cases:**
- Brand-specific configurations
- Module enablement
- Business-level policies

---

### Level 4: Outlet (Most Specific)
**Scope:** Individual store/location  
**File:** `platform/organization/outlet/settings/`

```typescript
{
  // Overrides business unit
  pos: {
    receiptFooter: "Visit us at Downtown Mall!"
  },
  timezone: "Asia/Kolkata" // Different TZ
}
```

**Use Cases:**
- Location-specific settings
- Store hours
- Local regulations

---

## Resolution Logic

### Code Reference
File: [`platform/settings/settings-resolution.service.ts`](../../src/app/modules/platform/settings/settings-resolution.service.ts)

### Algorithm
```typescript
function resolveSetting(key: string, context: Context) {
  // 1. Try Outlet
  if (context.outletId) {
    const value = await OutletSettings.get(context.outletId, key);
    if (value !== undefined) return value;
  }
  
  // 2. Try Business Unit
  if (context.businessUnitId) {
    const value = await BusinessUnitSettings.get(context.businessUnitId, key);
    if (value !== undefined) return value;
  }
  
  // 3. Try Company
  if (context.companyId) {
    const value = await CompanySettings.get(context.companyId, key);
    if (value !== undefined) return value;
  }
  
  // 4. Fallback to Platform
  return await PlatformSettings.get(key);
}
```

---

## Examples

### Example 1: Currency Resolution

**Setup:**
- Platform: `currency = "BDT"`
- Company: `currency = "USD"`
- BusinessUnit: (not set)
- Outlet: (not set)

**Request from Outlet:**
```typescript
const currency = await resolveSettings('currency', {
  outletId: 'outlet-123',
  businessUnitId: 'bu-456',
  companyId: 'company-789'
});
// Returns: "USD" (from Company)
```

---

### Example 2: POS Receipt Footer

**Setup:**
- Platform: (not set)
- Company: (not set)
- BusinessUnit: `pos.receiptFooter = "Thank you!"`
- Outlet: `pos.receiptFooter = "Visit Downtown Mall!"`

**Request from Outlet:**
```typescript
const footer = await resolveSettings('pos.receiptFooter', {
  outletId: 'outlet-123',
  businessUnitId: 'bu-456'
});
// Returns: "Visit Downtown Mall!" (from Outlet - most specific)
```

---

### Example 3: Complete Fallback Chain

**Setup:**
- Platform: `dateFormat = "DD/MM/YYYY"`
- Company: (not set)
- BusinessUnit: (not set)
- Outlet: (not set)

**Request from Outlet:**
```typescript
const format = await resolveSettings('dateFormat', {
  outletId: 'outlet-123',
  businessUnitId: 'bu-456',
  companyId: 'company-789'
});
// Returns: "DD/MM/YYYY" (from Platform - full fallback)
```

---

## Settings Categories

### General Settings
- Display (language, timezone, dateFormat)
- Security (session timeout, 2FA)
- Notification (email, SMS, push)
- SEO, Maintenance, Social

### Commerce Settings
- Inventory (lowStockAlert, tracking)
- Checkout (guestCheckout, couponCodes)
- Shipping (methods, rates)
- Rewards (points, tiers)

### Finance Settings
- Payment (methods, gateways)
- Tax (rates, rules)
- Prefixes (invoice, order)

### Module-Specific
- POS (cash drawer, receipt)
- HRM (attendance, leave)

---

## Best Practices

### 1. Use Appropriate Level
- **Platform:** System-wide, unchangeable
- **Company:** Regulatory, corporate
- **BusinessUnit:** Brand-specific
- **Outlet:** Location-specific

### 2. Avoid Over-Specification
Don't set outlet-level when business-unit would suffice.

### 3. Document Overrides
When overriding, add comment explaining why.

### 4. Test Resolution
Always test with different contexts.

---

## Related Files
- [`platform/settings/system-settings/system-settings.interface.ts`](../../src/app/modules/platform/settings/system-settings/system-settings.interface.ts)
- [`platform/organization/business-unit/settings/settings.interface.ts`](../../src/app/modules/platform/organization/business-unit/settings/settings.interface.ts)

---

## Troubleshooting

### Issue: Setting not applying
1. Check resolution order
2. Verify setting key path
3. Ensure context includes all IDs
4. Check for typos in nested keys

### Issue: Unexpected value
1. Check all 4 levels for overrides
2. Use debug mode in resolution service
3. Review audit logs

---

*For questions, see [System Design](./system-design.md)*
