export const RoleScope = {
    GLOBAL: 'GLOBAL',
    COMPANY: 'COMPANY', // Tenant / Group Level
    BUSINESS: 'BUSINESS',
    OUTLET: 'OUTLET',
    SELF: 'SELF'
} as const;

export type RoleScopeType = keyof typeof RoleScope;