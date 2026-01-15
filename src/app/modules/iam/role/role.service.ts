
import status from 'http-status';
import { Role } from './role.model.js';
import { RoleScope } from './role.constant.js';
import type { IRole } from './role.interface.js';
import { Permission } from '../permission/permission.model.js';
import { PermissionGroup } from '../permission-group/permission-group.model.js';
import type { JwtPayload } from 'jsonwebtoken';
import AppError from '@shared/errors/app-error.ts';
import { bumpVersion } from '../../../../core/utils/cacheKeys.ts';


class RoleService {
  // Helper to validate scope consistency
  private async validateScopeConsistency(roleScope: string, permissionIds: string[]) {
    // 1. If Role is GLOBAL, it can have any permission. No check needed.
    if (roleScope === RoleScope.GLOBAL) return;

    // 2. If Role is BUSINESS or OUTLET, it CANNOT have GLOBAL permissions
    if (permissionIds.length > 0) {
      const globalPermissions = await Permission.find({
        _id: { $in: permissionIds },
        scope: 'global' // Assuming 'scope' field exists in Permission model and lowercased 'global' matches
      }).select('id scope');

      if (globalPermissions.length > 0) {
        throw new AppError(
          status.BAD_REQUEST,
          `Security Violation: Cannot assign GLOBAL permissions to a ${roleScope} role. Denied permissions: ${globalPermissions.map(p => p.id).join(', ')}`
        );
      }
    }
  }

  // Get all roles
  async getAllRoles(query: any, user: JwtPayload) {
    const filter: any = {};

    if (query.isActive !== undefined) {
      filter.isActive = query.isActive === 'true';
    }

    if (query.isSystemRole !== undefined) {
      filter.isSystemRole = query.isSystemRole === 'true';
    }

    if (query.roleScope) {
      filter.roleScope = query.roleScope;
    }

    // 🛡️ ENFORCE SCOPING & HIERARCHY
    const authUser = user as any;
    if (authUser && !authUser.isSuperAdmin) {
      const authorizedCompanies = authUser.companies || [];
      const userLevel = authUser.hierarchyLevel || 0;
      filter.hierarchyLevel = { $lte: userLevel };

      const effectiveCompanyId = (query.companyId || query.company) as string;
      if (effectiveCompanyId) {
        // Only allow filtering by an authorized company
        if (authorizedCompanies.includes(effectiveCompanyId.toString())) {
          filter.$or = [
            { company: effectiveCompanyId },
            { company: { $exists: false } },
            { company: null }
          ];
        } else {
          // Access restricted: show only global roles
          filter.$or = [
            { company: { $exists: false } },
            { company: null }
          ];
        }
      } else {
        // No specific companyId: show all authorized companies + global roles
        filter.$or = [
          { company: { $in: authorizedCompanies } },
          { company: { $exists: false } },
          { company: null }
        ];
      }
    } else {
      const effectiveCompanyId = (query.companyId || query.company) as string;
      if (effectiveCompanyId) {
        // Super Admin or no specific user context
        filter.$or = [
          { company: effectiveCompanyId },
          { company: { $exists: false } },
          { company: null }
        ];
      }
    }

      // 🔍 Stricter Role Filtering: Non-platform users should NOT see GLOBAL roles
      // Platform users usually have a hierarchyLevel > 90 or specific platform-admin roles.
      // For safety, we check if they are NOT platform-level.
      const isPlatformUser = authUser.roleName?.some((r: string) => 
        ['super-admin', 'platform-admin', 'platform-support', 'platform-finance'].includes(r.toLowerCase())
      );

      if (!isPlatformUser) {
        filter.roleScope = { $ne: RoleScope.GLOBAL };
      }

    const roles = await Role.find(filter)
      .populate('permissions', 'id resource action description')
      .populate('permissionGroups', 'name description')
      .populate('inheritedRoles', 'name description')
      .sort({ hierarchyLevel: -1, name: 1 });

    return roles;
  }

  // Get single role
  async getRoleById(id: string) {
    const role = await Role.findById(id)
      .populate('permissions')
      .populate('permissionGroups')
      .populate('inheritedRoles')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!role) {
      throw new AppError(status.NOT_FOUND, 'Role not found');
    }

    return role;
  }

  // Create role
  async createRole(payload: Partial<IRole>, user: JwtPayload) {
    // Check if role name already exists
    const existingRole = await Role.findOne({ name: payload.name });
    if (existingRole) {
      throw new AppError(status.CONFLICT, 'Role with this name already exists');
    }

    // Validate permissions exist
    if (payload.permissions && payload.permissions.length > 0) {
      const validPermissions = await Permission.find({
        _id: { $in: payload.permissions },
        isActive: true,
      });

      if (validPermissions.length !== payload.permissions.length) {
        throw new AppError(status.BAD_REQUEST, 'Some permissions are invalid or inactive');
      }

      // ENFORCE SCOPE GUARD
      if (payload.roleScope) {
        await this.validateScopeConsistency(payload.roleScope, payload.permissions as unknown as string[]);
      }
    }

    // 🛡️ HIERARCHY ESCALATION GUARD
    const authUser = user as any;
    if (authUser && !authUser.isSuperAdmin) {
      const userLevel = authUser.hierarchyLevel || 0;
      if (payload.hierarchyLevel && payload.hierarchyLevel > userLevel) {
        throw new AppError(status.FORBIDDEN, `Security Violation: Cannot create a role with hierarchy level (${payload.hierarchyLevel}) higher than your own (${userLevel}).`);
      }
      // If no level provided, default to user's level or lower
      if (!payload.hierarchyLevel) {
        payload.hierarchyLevel = Math.min(userLevel, 1);
      }
    }

    // Validate permission groups
    if (payload.permissionGroups && payload.permissionGroups.length > 0) {
      const validGroups = await PermissionGroup.find({
        _id: { $in: payload.permissionGroups },
        isActive: true,
      });

      if (validGroups.length !== payload.permissionGroups.length) {
        throw new AppError(status.BAD_REQUEST, 'Some permission groups are invalid or inactive');
      }
    }

    // Validate inherited roles
    if (payload.inheritedRoles && payload.inheritedRoles.length > 0) {
      const validRoles = await Role.find({
        _id: { $in: payload.inheritedRoles },
        isActive: true,
      });

      if (validRoles.length !== payload.inheritedRoles.length) {
        throw new AppError(status.BAD_REQUEST, 'Some inherited roles are invalid');
      }
    }

    const userId = user['userId'] || user['id'] || user['_id'] || user['sub'];

    if (!userId) {
      throw new AppError(status.UNAUTHORIZED, "User ID missing from token");
    }

    const roleData = {
      ...payload,
      createdBy: userId,
      updatedBy: userId,
    };

    const role = await Role.create(roleData);

    await bumpVersion('role');

    return role;
  }

  // Update role
  async updateRole(id: string, payload: Partial<IRole>, user: JwtPayload) {
    const role = await Role.findById(id);

    if (!role) {
      throw new AppError(status.NOT_FOUND, 'Role not found');
    }

    // Prevent unsetting system roles
    if (role.isSystemRole && payload.isSystemRole === false) {
      throw new AppError(status.FORBIDDEN, 'Cannot unset system role status');
    }

    // Prevent renaming system roles
    if (role.isSystemRole && payload.name && payload.name !== role.name) {
      throw new AppError(status.FORBIDDEN, 'Cannot rename system roles');
    }

    // Check if new name already exists
    if (payload.name && payload.name !== role.name) {
      const existingRole = await Role.findOne({ name: payload.name });
      if (existingRole) {
        throw new AppError(status.CONFLICT, 'Role with this name already exists');
      }
    }

    // Validate permissions if provided
    if (payload.permissions && payload.permissions.length > 0) {
      const validPermissions = await Permission.find({
        _id: { $in: payload.permissions },
        isActive: true,
      });

      if (validPermissions.length !== payload.permissions.length) {
        throw new AppError(status.BAD_REQUEST, 'Some permissions are invalid');
      }
    }

    // 🛡️ HIERARCHY ESCALATION GUARD
    const authUser = user as any;
    if (authUser && !authUser.isSuperAdmin) {
      const userLevel = authUser.hierarchyLevel || 0;

      // 1. Cannot set a new level higher than your own
      if (payload.hierarchyLevel && payload.hierarchyLevel > userLevel) {
        throw new AppError(status.FORBIDDEN, `Security Violation: Cannot set hierarchy level higher than your own (${userLevel}).`);
      }

      // 2. Cannot update a role that is already more powerful than you
      if (role.hierarchyLevel > userLevel) {
        throw new AppError(status.FORBIDDEN, `Security Violation: Cannot modify a role with higher authority than your own.`);
      }
    }

    // Validate permission groups if provided
    if (payload.permissionGroups && payload.permissionGroups.length > 0) {
      const validGroups = await PermissionGroup.find({
        _id: { $in: payload.permissionGroups },
        isActive: true,
      });

      if (validGroups.length !== payload.permissionGroups.length) {
        throw new AppError(status.BAD_REQUEST, 'Some permission groups are invalid or inactive');
      }
    }

    const updatedRole = await Role.findByIdAndUpdate(
      id,
      {
        ...payload,
        updatedBy: user['userId'],
      },
      { new: true, runValidators: true }
    ).populate('permissions');

    await bumpVersion('role');

    return updatedRole;
  }

  // Delete role
  async deleteRole(id: string) {
    const role = await Role.findById(id);

    if (!role) {
      throw new AppError(status.NOT_FOUND, 'Role not found');
    }

    // Prevent deleting system roles
    if (role.isSystemRole) {
      throw new AppError(status.FORBIDDEN, 'Cannot delete system roles');
    }

    // Check if role is assigned to any users
    const { User } = await import('../user/user.model.js');
    const usersWithRole = await User.countDocuments({ roles: id });

    if (usersWithRole > 0) {
      throw new AppError(
        status.CONFLICT,
        `Cannot delete role. ${usersWithRole} user(s) are assigned this role`
      );
    }

    await Role.findByIdAndDelete(id);

    await bumpVersion('role');
  }

  // Assign permissions to role
  async assignPermissions(roleId: string, permissionIds: string[], user: JwtPayload) {
    const role = await Role.findById(roleId);

    if (!role) {
      throw new AppError(status.NOT_FOUND, 'Role not found');
    }

    // Validate permissions
    const validPermissions = await Permission.find({
      _id: { $in: permissionIds },
      isActive: true,
    });

    if (validPermissions.length !== permissionIds.length) {
      throw new AppError(status.BAD_REQUEST, 'Some permissions are invalid');
    }

    // ENFORCE SCOPE GUARD
    await this.validateScopeConsistency(role.roleScope, permissionIds);

    // Add permissions (avoid duplicates)
    const existingPermissions = role.permissions.map(p => p.toString());
    const newPermissions = permissionIds.filter(
      id => !existingPermissions.includes(id)
    );

    if (newPermissions.length === 0) {
      throw new AppError(status.BAD_REQUEST, 'All permissions are already assigned');
    }

    role.permissions.push(...newPermissions as any);
    role.updatedBy = user['userId'] as any;
    await role.save();

    await bumpVersion('role');

    return role.populate('permissions');
  }

  // Remove permissions from role
  async removePermissions(roleId: string, permissionIds: string[], user: JwtPayload) {
    const role = await Role.findById(roleId);

    if (!role) {
      throw new AppError(status.NOT_FOUND, 'Role not found');
    }

    // Remove permissions
    role.permissions = role.permissions.filter(
      (p: any) => !permissionIds.includes(p.toString())
    ) as any;

    role.updatedBy = user['userId'] as any;
    await role.save();

    await bumpVersion('role');

    return role.populate('permissions');
  }
}

export const roleService = new RoleService();
