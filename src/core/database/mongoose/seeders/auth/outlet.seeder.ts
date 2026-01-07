import { Types } from "mongoose";
import { RoleScope } from "@app/modules/iam/role/role.constant.ts";
import { USER_ROLE } from "@app/modules/iam/user/user.constant.ts";
import { PermissionSourceObj } from "@app/modules/iam/permission/permission.constant.ts";
import { DEFAULT_LIMITS } from "./data/constants.ts";

export const getOutletRoleConfigs = (get: (r: string) => Types.ObjectId | null) => [
    {
        name: USER_ROLE.OUTLET_MANAGER,
        permissionGroups: [
            get(PermissionSourceObj.order),
            get(PermissionSourceObj.inventory),
            get(PermissionSourceObj.customer),
            get(PermissionSourceObj.report), // Outlet specific report
            get(PermissionSourceObj.staff), // Manage outlet staff
            get(PermissionSourceObj.storefront),
            get(PermissionSourceObj.terminal),
            get(PermissionSourceObj.cashRegister),
            get(PermissionSourceObj.payment),
            get(PermissionSourceObj.return),
            get(PermissionSourceObj.coupon),
            get(PermissionSourceObj.promotion),
        ].filter(Boolean),
        hierarchyLevel: 45,
        roleScope: RoleScope.OUTLET,
        isDefault: false,
    },
    {
        name: USER_ROLE.STORE_KEEPER,
        permissionGroups: [
            get(PermissionSourceObj.inventory),
            get(PermissionSourceObj.purchase),
            get(PermissionSourceObj.supplier),
            get(PermissionSourceObj.adjustment),
            get(PermissionSourceObj.transfer),
            get(PermissionSourceObj.warehouse),
            get(PermissionSourceObj.variant),
            get(PermissionSourceObj.warranty),
            get(PermissionSourceObj.product),
        ].filter(Boolean),
        hierarchyLevel: 40,
        roleScope: RoleScope.OUTLET,
        isDefault: false,
    },
    {
        name: USER_ROLE.CASHIER,
        permissionGroups: [
            get(PermissionSourceObj.storefront),
            get(PermissionSourceObj.order),
            get(PermissionSourceObj.payment),
            get(PermissionSourceObj.customer),
            get(PermissionSourceObj.return),
            get(PermissionSourceObj.coupon),
            get(PermissionSourceObj.product),
            get(PermissionSourceObj.terminal),
            get(PermissionSourceObj.cashRegister),
        ].filter(Boolean),
        hierarchyLevel: 30,
        roleScope: RoleScope.OUTLET,
        isDefault: false,
        limits: {
            ...DEFAULT_LIMITS,
            financial: { ...DEFAULT_LIMITS.financial, maxDiscountPercent: 5, maxRefundAmount: 500 }
        }
    },
    {
        name: USER_ROLE.SALES_ASSOCIATE,
        permissionGroups: [
            get(PermissionSourceObj.customer),
            get(PermissionSourceObj.product),
            get(PermissionSourceObj.order),
            get(PermissionSourceObj.quotation),
        ].filter(Boolean),
        hierarchyLevel: 25,
        roleScope: RoleScope.OUTLET,
        isDefault: false,
    },
    {
        name: USER_ROLE.WAITER,
        permissionGroups: [
            get(PermissionSourceObj.order),
        ].filter(Boolean),
        hierarchyLevel: 20,
        roleScope: RoleScope.OUTLET,
        isDefault: false,
    },
    {
        name: USER_ROLE.KITCHEN_STAFF,
        permissionGroups: [
            get(PermissionSourceObj.order),
        ].filter(Boolean),
        hierarchyLevel: 20,
        roleScope: RoleScope.OUTLET,
        isDefault: false,
    },
    {
        name: USER_ROLE.PACKAGING_STAFF,
        permissionGroups: [
            get(PermissionSourceObj.order),
        ].filter(Boolean),
        hierarchyLevel: 20,
        roleScope: RoleScope.OUTLET,
        isDefault: false,
    },
    {
        name: USER_ROLE.DELIVERY_MAN,
        permissionGroups: [
            get(PermissionSourceObj.order),
            get(PermissionSourceObj.customer),
        ].filter(Boolean),
        hierarchyLevel: 20,
        roleScope: RoleScope.OUTLET,
        isDefault: false,
    },
    {
        name: USER_ROLE.STAFF, // General Staff
        permissionGroups: [
            get(PermissionSourceObj.attendance),
        ].filter(Boolean),
        hierarchyLevel: 15,
        roleScope: RoleScope.BUSINESS,
        isDefault: false,
    },
    {
        name: USER_ROLE.CUSTOMER,
        permissionGroups: [
            get(PermissionSourceObj.cart),
            get(PermissionSourceObj.wishlist),
            get(PermissionSourceObj.order),
            get(PermissionSourceObj.review),
        ].filter(Boolean),
        hierarchyLevel: 5,
        roleScope: RoleScope.SELF,
        isDefault: true,
    },
];
