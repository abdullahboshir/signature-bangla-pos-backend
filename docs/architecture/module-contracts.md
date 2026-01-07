# Module Communication Contracts

**Last Updated:** 2026-01-07  
**Purpose:** Define strict rules for cross-module communication to prevent tight coupling

---

## Core Principles

### 1. Module Independence
Each module should be independently deployable and testable.

### 2. Explicit Contracts
All cross-module communication happens through documented interfaces.

### 3. Barrel-Only Imports
Modules expose public APIs exclusively through `index.ts` barrel files.

---

## Rules

### ❌ FORBIDDEN Patterns

#### Direct Service/Model Imports Between Business Modules
```typescript
// ❌ WRONG
import { SalesService } from '@app/modules/commerce/sales/order/order.service.js';
import { Purchase } from '@app/modules/erp/purchase/purchase.model.js';
```

**Why Forbidden:**
- Creates tight coupling
- Makes refactoring difficult
- Violates module boundaries

---

### ✅ ALLOWED Patterns

#### 1. Barrel File Imports Only
```typescript
// ✅ CORRECT
import { Order, SalesService } from '@app/modules/commerce/index.js';
import { Purchase } from '@app/modules/erp/index.js';
```

#### 2. Infrastructure Modules (Always Allowed)
```typescript
// ✅ CORRECT - Infrastructure dependencies
import { User, Role } from '@app/modules/iam/index.js';
import { BusinessUnit } from '@app/modules/platform/index.js';
```

**Allowed Infrastructure Modules:**
- `iam` - Authentication & Authorization
- `platform` - Core services (BusinessUnit, Settings, Queue)
- `contacts` - Shared customer/supplier data

---

## Module Categories

### Business Modules (Peer Level)
**Cannot directly import from each other**
- `commerce` - Product catalog, sales
- `erp` - Inventory, purchases, accounting
- `pos` - Point of sale operations
- `hrm` - Human resources
- `governance` - Corporate governance
- `marketing` - Marketing campaigns

### Infrastructure Modules (Foundation Level)
**Can be imported by any module**
- `iam` - Users, roles, permissions
- `platform` - Organization, settings, queues
- `contacts` - Customer/supplier management

---

## Cross-Module Communication Patterns

### ✅ Pattern 1: Shared Data via Platform
```typescript
// commerce needs customer data
import { Customer } from '@app/modules/contacts/index.js';
```

### ✅ Pattern 2: Event-Driven (Future)
```typescript
// When implemented:
EventBus.emit('order.created', orderData);
EventBus.on('inventory.updated', handler);
```

### ✅ Pattern 3: Platform Abstraction
```typescript
// Use platform services for cross-cutting concerns
import { QueueService } from '@app/modules/platform/index.js';
```

---

## Enforcement

### Manual Review
- Code reviews check for barrel imports
- Architecture reviews validate module dependencies

### Future: Automated (Optional)
```json
// ESLint rule (future enhancement)
{
  "no-restricted-imports": {
    "patterns": [
      "@app/modules/*/!(index).js"
    ]
  }
}
```

---

## Examples

### ❌ Bad: Direct Cross-Module Service Call
```typescript
// In commerce/sales/order/order.service.ts
import { InventoryService } from '@app/modules/erp/inventory/inventory.service.js';

// Updates inventory directly
await InventoryService.decreaseStock(productId, quantity);
```

### ✅ Good: Via Barrel + Events
```typescript
// In commerce/sales/order/order.service.ts
import { QueueService } from '@app/modules/platform/index.js';

// Queue job for inventory update
await QueueService.add('inventory-update', {
  productId,
  quantity,
  operation: 'decrease'
});
```

---

## Exception Handling

### When Cross-Module Call is Unavoidable
1. **Document the dependency** in both modules
2. **Use barrel imports only**
3. **Create integration test**
4. **Consider refactoring** to event-driven

---

## Related Documentation
- [Module Map](./module_map.md)
- [Settings Resolution](./settings-resolution.md)
- [System Design](./system-design.md)
