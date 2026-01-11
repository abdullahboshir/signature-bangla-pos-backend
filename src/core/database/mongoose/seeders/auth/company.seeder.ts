import { Types } from "mongoose";
import { RoleScope } from "@app/modules/iam/role/role.constant.ts";
import { USER_ROLE } from "@app/modules/iam/user/user.constant.ts";
import { PermissionSourceObj } from "@app/modules/iam/permission/permission.constant.ts";

export const getCompanyRoleConfigs = (get: (r: string) => Types.ObjectId | null) => [
    {
        name: USER_ROLE.COMPANY_OWNER, // Group Chairman/MD
        permissionGroups: [
            get(PermissionSourceObj.businessUnit), // Manage Business Units
            get(PermissionSourceObj.user), // Manage Admin Users
            get(PermissionSourceObj.role), // Manage Roles
            get(PermissionSourceObj.report), // All Reports
            get(PermissionSourceObj.dashboard), // Global Dashboard
            get(PermissionSourceObj.subscription), // Manage SaaS Subscription
            // Governance
            get(PermissionSourceObj.shareholder),
            get(PermissionSourceObj.voting),
            get(PermissionSourceObj.meeting),
            get(PermissionSourceObj.compliance),
            // Operational (For Business Unit Management)
            get(PermissionSourceObj.product),
            get(PermissionSourceObj.category),
            get(PermissionSourceObj.order),
            get(PermissionSourceObj.inventory),
            get(PermissionSourceObj.customer),
            get(PermissionSourceObj.staff),
            get(PermissionSourceObj.payment),
            get(PermissionSourceObj.expense),
            get(PermissionSourceObj.terminal),
        ].filter(Boolean),
        hierarchyLevel: 95,
        roleScope: RoleScope.COMPANY,
        isDefault: false,
    },
    {
        name: USER_ROLE.SHAREHOLDER,
        permissionGroups: [
            get(PermissionSourceObj.voting),
            get(PermissionSourceObj.meeting),
            get(PermissionSourceObj.compliance),
            get(PermissionSourceObj.report),
            get(PermissionSourceObj.dashboard),
        ].filter(Boolean),
        hierarchyLevel: 80,
        roleScope: RoleScope.COMPANY,
        isDefault: false,
    },
];
