export const USER_ROLE = {
  // System / Platform
  SUPER_ADMIN: 'super-admin',
  PLATFORM_ADMIN: 'platform-admin',
  PLATFORM_SUPPORT: 'platform-support',
  PLATFORM_FINANCE: 'platform-finance',
  PLATFORM_AUDITOR: 'platform-auditor',
  PLATFORM_DEVOPS: 'platform-devops', // New
  PLATFORM_ANALYST: 'platform-analyst', // New
  PLATFORM_MARKETING: 'platform-marketing', // New
  PLATFORM_LEGAL: 'platform-legal', // New
  SYSTEM_INTEGRATION: 'system-integration', // New

  // Business Level
  ADMIN: 'admin', // Keeping legacy key for compatibility, but represents Business Admin
  BUSINESS_ADMIN: 'business-admin', // Explicit alias if needed, or we can migrate to this
  MANAGER: 'manager',
  BUSINESS_MANAGER: 'business-manager', // Explicit alias

  // Department / Function
  ACCOUNTANT: 'accountant',
  HR_MANAGER: 'hr_manager',
  STORE_KEEPER: 'store_keeper',
  PURCHASE_MANAGER: 'purchase_manager', // New
  ASSET_MANAGER: 'asset_manager', // New

  // Outlet / Frontline
  CASHIER: 'cashier',
  SALES_ASSOCIATE: 'sales_associate',
  DELIVERY_MAN: 'delivery-man',
  SUPPORT_AGENT: 'support-agent', // Maybe business support?
  STAFF: 'staff',
  WAITER: 'waiter', // New
  KITCHEN_STAFF: 'kitchen_staff', // New
  PACKAGING_STAFF: 'packaging_staff', // New

  // End User
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
