export const USER_ROLE = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  VENDOR: 'vendor',
  CUSTOMER: 'customer',
  DELIVERY_MAN: 'delivery-man',
  SUPPORT_AGENT: 'support-agent',
  GUEST: 'guest',
  CASHIER: 'cashier',
  SALES_ASSOCIATE: 'sales_associate',
  STORE_KEEPER: 'store_keeper',
  STAFF: 'staff'
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
