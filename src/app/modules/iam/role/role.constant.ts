export const RoleScope = {
    GLOBAL: 'GLOBAL',
    BUSINESS: 'BUSINESS',
    OUTLET: 'OUTLET'
} as const;

export type RoleScopeType = keyof typeof RoleScope;