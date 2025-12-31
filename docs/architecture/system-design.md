# System Design & Architectural Standards

## 1. Directory Structure Modules
### 1.1 Product Module Strategy
- **`domain/` (Aggregate Root)**: Contains the core business logic, schema, and interfaces that define the entity.
  - Example: `product/domain/product-core/`
- **`features/` (Extensions)**: Optional, detachable sub-modules that extend core functionality.
  - Example: `product/features/product-reviews/`
  - *Rule*: Features can import from Domain, but Domain **SHOULD NOT** import from Features (to avoid circular deps).
- **`shared/`**: Types and utilities reusable across features.

### 1.2 Module Composition
- **Full Module**: Contains `controller`, `service`, `model`, `routes`.
- **Data-Only Module**: Contains only `model`, `interface`.
  - *Rule*: If a module is data-only (shared library), strictly document it with a `README.md` to prevent "incomplete" confusion.

### 1.3 Routing Strategy
- **Internal Definition**: `src/app/modules/[domain]/[feature]/[feature].routes.ts` defines the specific routes for that feature.
- **External Exposure**: `src/app/routes/v1/[role]/*.routes.ts` imports and exposes the module routes.
  - *Reasoning*: Allows versioning and role-based aggregation without modifying module internals.

## 2. Naming Conventions (Strict)
| Type | Suffix | Purpose | Example |
|------|--------|---------|---------|
| **Interface** | `.interface.ts` | TypeScript Definitions / DB Shape | `user.interface.ts` |
| **DTO** | `.dto.ts` | Request/Response Data Transfer Objects | `create-user.dto.ts` |
| **Model** | `.model.ts` | Mongoose/ORM Schema Definition | `user.model.ts` |
| **Service** | `.service.ts` | Business Logic / Transaction handling | `user.service.ts` |
| **Controller** | `.controller.ts` | HTTP Request Handler (Req/Res) | `user.controller.ts` |
| **Routes** | `.routes.ts` | Router Definition | `user.routes.ts` |
| **Validation** | `.validation.ts` | Zod/Joi Schemas | `user.validation.ts` |
| **Utils** | `.utils.ts` | Helper Functions | `user.utils.ts` |

## 3. Storage Strategy
- **Production Safety**: Backend **MUST NOT** rely on local `storage/` in Production.
- **Implementation**:
  - `local.provider.ts`: Enabled ONLY for Development (`NODE_ENV!=production`).
  - `s3.provider.ts` / `cloudinary.provider.ts`: Mandatory for Production.
  - **Guard**: System will throw a critical error if `local` provider is detected in `production` environment.
- **Data Integrity**: Database stores **metadata & URLs only**. Files reside in Object Storage.

## 4. API Response Structure
- **Consistency**: All responses must use `ApiResponse` utility.
- **Login**: Return `accessToken` only. User details fetched via `/auth/me`.
- **Permissions**: Flattened string array `["resource:action"]`.

## 5. Domain Boundaries (Risk Mitigation)
### 5.1 Business Unit Core
- **Rule**: `business-unit/core` is the **source of truth**.
- **Constraint**: Sub-modules (`finance`, `analytics`) depend on `core`. `core` **MUST NEVER** import from sub-modules to prevent circular dependencies.

### 5.2 Platform vs ERP
- **Platform (`src/app/modules/platform`)**: Handles **Configuration**, **Enable/Disable** switches, and **Global Settings**.
  - Example: `TaxSettings` (Enable VAT, Set Standard Rate).
- **ERP (`src/app/modules/erp`)**: Handles **Accounting Logic**, **Calculations**, and **Transactional Data**.
  - Example: `TaxCalculator` (Apply VAT to Order, generate Ledger Entry).
- **Constraint**: Platform settings **DO NOT** perform complex math. ERP modules **DO NOT** store global configurations.
