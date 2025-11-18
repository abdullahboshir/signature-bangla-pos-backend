import AppError from '../../errors/AppError.js';
import status from 'http-status';
import { Role } from './role.model.js';
import type { IRole } from './role.interface.js';
import { Permission } from '../permission/permission.model.js';
import { bumpVersion } from '../../utils/cacheKeys.js';
import type { JwtPayload } from 'jsonwebtoken';

class RoleService {
  // Get all roles
  async getAllRoles(query: any) {
    const filter: any = {};
    
    if (query.isActive !== undefined) {
      filter.isActive = query.isActive === 'true';
    }
    
    if (query.isSystemRole !== undefined) {
      filter.isSystemRole = query.isSystemRole === 'true';
    }

    const roles = await Role.find(filter)
      .populate('permissions', 'id resource action description')
      .populate('permissionGroups')
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

    const roleData = {
      ...payload,
      createdBy: user['userId'],
      updatedBy: user['userId'],
    };

    const role = await Role.create(roleData);
    
    // Bump cache version
    await bumpVersion('role');

    return role;
  }

  // Update role
  async updateRole(id: string, payload: Partial<IRole>, user: JwtPayload) {
    const role = await Role.findById(id);

    if (!role) {
      throw new AppError(status.NOT_FOUND, 'Role not found');
    }

    // Prevent updating system roles
    if (role.isSystemRole && !payload.isSystemRole) {
      throw new AppError(status.FORBIDDEN, 'Cannot modify system roles');
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

    const updatedRole = await Role.findByIdAndUpdate(
      id,
      {
        ...payload,
        updatedBy: user[`userId`],
      },
      { new: true, runValidators: true }
    ).populate('permissions');

    // Bump cache version
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
    
    // Bump cache version
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

    // Bump cache version
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

    // Bump cache version
    await bumpVersion('role');

    return role.populate('permissions');
  }
}

export const roleService = new RoleService();
