export const USER_ROLE = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  VENDOR: 'vendor',
  CUSTOMER: 'customer',
  DELIVERY_MAN: 'delivery_man',
  SUPPORT_AGENT: 'support_agent',
  GUEST: 'guest'
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
