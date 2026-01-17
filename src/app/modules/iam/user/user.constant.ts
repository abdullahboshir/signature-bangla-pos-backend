export const USER_ROLE = {
  // ========================================================================
  // 1. PLATFORM LEVEL (Global Scope)
  // These roles manage the SaaS system itself, not specific businesses.
  // ========================================================================
  SUPER_ADMIN: 'super-admin',
  PLATFORM_ADMIN: 'platform-admin',
  PLATFORM_SUPPORT: 'platform-support',
  PLATFORM_FINANCE: 'platform-finance',
  PLATFORM_AUDITOR: 'platform-auditor',
  PLATFORM_DEVOPS: 'platform-devops',
  PLATFORM_ANALYST: 'platform-analyst',
  PLATFORM_MARKETING: 'platform-marketing',
  PLATFORM_LEGAL: 'platform-legal',
  SYSTEM_INTEGRATION: 'system-integration', // For API/Webhooks

  // ========================================================================
  // 2. ORGANIZATION LEVEL (Tenant/Group Scope)
  // These roles manage the entire organization/holding group across all business units.
  // ========================================================================
  ORGANIZATION_OWNER: 'organization-owner', // Group Chairman/MD - manages entire organization

  // ========================================================================
  // 3. BUSINESS LEVEL (Business Unit Scope)
  // These roles operate WITHIN a specific Business Unit (vertical).
  // ========================================================================
  // Core Management
  ADMIN: 'admin',            // The Business Unit Owner / Main Administrator
  MANAGER: 'manager',        // Operations Manager (General)
  OUTLET_MANAGER: 'outlet-manager', // Specific Outlet Manager

  // Department Heads
  HR_MANAGER: 'hr-manager',
  STORE_KEEPER: 'store-keeper',
  PURCHASE_MANAGER: 'purchase-manager',
  ASSET_MANAGER: 'asset-manager',
  BUSINESS_ANALYST: 'business-analyst',
  BUSINESS_FINANCE: 'business-finance',
  ACCOUNTANT: 'accountant',
  SHAREHOLDER: 'shareholder',

  // Frontline / Outlet Operations
  CASHIER: 'cashier',
  SALES_ASSOCIATE: 'sales-associate',
  DELIVERY_MAN: 'delivery-man',
  SUPPORT_AGENT: 'support-agent', // Business-level support staff
  STAFF: 'staff',

  // Hospitality / Service Specific
  WAITER: 'waiter',
  KITCHEN_STAFF: 'kitchen-staff',
  PACKAGING_STAFF: 'packaging-staff',

  // ========================================================================
  // 4. EXTERNAL / END USERS
  // ========================================================================
  VENDOR: 'vendor',
  CUSTOMER: 'customer',
  GUEST: 'guest',
} as const;

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
  BLOCKED: 'blocked',
} as const;

export const USER_ROLE_ARRAY = Object.values(USER_ROLE);
export const USER_STATUS_ARRAY = Object.values(USER_STATUS);
