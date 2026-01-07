import { Types } from "mongoose";
import { RoleScope } from "@app/modules/iam/role/role.constant.ts";
import { USER_ROLE } from "@app/modules/iam/user/user.constant.ts";
import { PermissionSourceObj } from "@app/modules/iam/permission/permission.constant.ts";
import { DEFAULT_LIMITS } from "./data/constants.ts";

export const getPlatformRoleConfigs = (get: (r: string) => Types.ObjectId | null, fullGroupId: Types.ObjectId) => [
    // 🔴 LEVEL 1: SUPER-ADMIN (Platform)
    {
        name: USER_ROLE.SUPER_ADMIN,
        permissionGroups: [fullGroupId], // Automated: Full Access always
        hierarchyLevel: 100,
        roleScope: RoleScope.GLOBAL,
        isDefault: false,
        limits: DEFAULT_LIMITS
    },
    {
        name: USER_ROLE.PLATFORM_ADMIN,
        permissionGroups: [
            get(PermissionSourceObj.user),
            get(PermissionSourceObj.role),
            get(PermissionSourceObj.systemConfig),
            get(PermissionSourceObj.platformSetting),
            get(PermissionSourceObj.report),
            get(PermissionSourceObj.subscription),
            get(PermissionSourceObj.license),
            get(PermissionSourceObj.feature),
            get(PermissionSourceObj.automation),
            get(PermissionSourceObj.workflow),
            get(PermissionSourceObj.permission),
            get(PermissionSourceObj.auth),
            get(PermissionSourceObj.auditLog),
            get(PermissionSourceObj.backup),
            get(PermissionSourceObj.blacklist),
            get(PermissionSourceObj.apiKey),
            get(PermissionSourceObj.webhook),
            get(PermissionSourceObj.integration),
        ].filter(Boolean),
        hierarchyLevel: 95,
        roleScope: RoleScope.GLOBAL,
        isDefault: false,
    },
    {
        name: USER_ROLE.PLATFORM_SUPPORT,
        permissionGroups: [
            get(PermissionSourceObj.customer),
            get(PermissionSourceObj.order),
            get(PermissionSourceObj.report),
            get(PermissionSourceObj.ticket),
            get(PermissionSourceObj.chat),
            get(PermissionSourceObj.dispute),
        ].filter(Boolean),
        hierarchyLevel: 80,
        roleScope: RoleScope.GLOBAL,
        isDefault: false,
    },
    {
        name: USER_ROLE.PLATFORM_FINANCE,
        permissionGroups: [
            get(PermissionSourceObj.account),
            get(PermissionSourceObj.transaction),
            get(PermissionSourceObj.payment),
            get(PermissionSourceObj.settlement),
            get(PermissionSourceObj.payout),
            get(PermissionSourceObj.reconciliation),
        ].filter(Boolean),
        hierarchyLevel: 80,
        roleScope: RoleScope.GLOBAL,
        isDefault: false,
    },
    {
        name: USER_ROLE.PLATFORM_AUDITOR,
        permissionGroups: [
            get(PermissionSourceObj.report),
            get(PermissionSourceObj.auditLog),
        ].filter(Boolean),
        hierarchyLevel: 70,
        roleScope: RoleScope.GLOBAL,
        isDefault: false,
    },
    {
        name: USER_ROLE.PLATFORM_DEVOPS,
        permissionGroups: [
            get(PermissionSourceObj.systemConfig),
            get(PermissionSourceObj.platformSetting),
            get(PermissionSourceObj.apiKey),
            get(PermissionSourceObj.webhook),
            get(PermissionSourceObj.backup),
            get(PermissionSourceObj.auditLog),
            get(PermissionSourceObj.report),
        ].filter(Boolean),
        hierarchyLevel: 85,
        roleScope: RoleScope.GLOBAL,
        isDefault: false,
    },
    {
        name: USER_ROLE.PLATFORM_ANALYST,
        permissionGroups: [
            get(PermissionSourceObj.report),
            get(PermissionSourceObj.analyticsReport),
            get(PermissionSourceObj.dashboard),
        ].filter(Boolean),
        hierarchyLevel: 60,
        roleScope: RoleScope.GLOBAL,
        isDefault: false,
    },
    {
        name: USER_ROLE.PLATFORM_MARKETING,
        permissionGroups: [
            get(PermissionSourceObj.adCampaign),
            get(PermissionSourceObj.affiliate),
            get(PermissionSourceObj.loyalty),
            get(PermissionSourceObj.customer),
            get(PermissionSourceObj.report),
            get(PermissionSourceObj.audience),
            get(PermissionSourceObj.pixel),
            get(PermissionSourceObj.event),
            get(PermissionSourceObj.landingPage),
            get(PermissionSourceObj.seo),
        ].filter(Boolean),
        hierarchyLevel: 55,
        roleScope: RoleScope.GLOBAL,
        isDefault: false,
    },
    {
        name: USER_ROLE.PLATFORM_LEGAL,
        permissionGroups: [
            get(PermissionSourceObj.report),
            get(PermissionSourceObj.user),
        ].filter(Boolean),
        hierarchyLevel: 55,
        roleScope: RoleScope.GLOBAL,
        isDefault: false,
    },
    {
        name: USER_ROLE.SYSTEM_INTEGRATION,
        permissionGroups: [
            get(PermissionSourceObj.webhook),
            get(PermissionSourceObj.apiKey),
            get(PermissionSourceObj.user),
            get(PermissionSourceObj.integration),
        ].filter(Boolean),
        hierarchyLevel: 50,
        roleScope: RoleScope.GLOBAL,
        isDefault: false,
    },
    {
        name: USER_ROLE.GUEST,
        permissionGroups: [
            get(PermissionSourceObj.product),
        ].filter(Boolean),
        hierarchyLevel: 0,
        roleScope: RoleScope.GLOBAL,
        isDefault: true,
    },
];
