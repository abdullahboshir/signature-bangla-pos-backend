import { PermissionGroup } from './permission-group.model.js';
import type { IPermissionGroup } from '../permission/permission.interface.js';
import { bumpVersion } from '../../../../core/utils/cacheKeys.ts';

class PermissionGroupService {
    /**
     * Get all permission groups with filtering, sorting, and pagination
     */
    async getAllGroups(query: Record<string, any>) {
        const page = Number(query['page']) || 1;
        const limit = Number(query['limit']) || 10;
        const skip = (page - 1) * limit;

        const filter: Record<string, any> = {};
        if (query['isActive'] !== undefined) {
            filter['isActive'] = query['isActive'] === 'true';
        }
        if (query['search']) {
            filter['name'] = { $regex: query['search'], $options: 'i' };
        }

        const result = await PermissionGroup.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('permissions');

        const total = await PermissionGroup.countDocuments(filter);

        return {
            result,
            meta: {
                page,
                limit,
                total,
            },
        };
    }

    /**
     * Get a single permission group by ID
     */
    /**
     * Get a single permission group by ID
     */
    async getGroupById(id: string) {
        return await PermissionGroup.findById(id).populate('permissions');
    }

    /**
     * Create a new permission group
     */
    async createGroup(payload: Partial<IPermissionGroup>) {
        // Check duplicate name
        const existingToken = await PermissionGroup.findOne({ name: payload.name });
        if (existingToken) {
            throw new Error('Permission group with this name already exists');
        }
        const group = await PermissionGroup.create(payload);
        await bumpVersion('permission-group');
        return group;
    }

    /**
     * Update a permission group
     */
    async updateGroup(id: string, payload: Partial<IPermissionGroup>) {
        const group = await PermissionGroup.findById(id);
        if (!group) throw new Error('Permission group not found');

        if (payload.name && payload.name !== group.name) {
            const existing = await PermissionGroup.findOne({ name: payload.name });
            if (existing) throw new Error('Permission group name already exists');
        }

        Object.assign(group, payload);
        const result = await group.save();
        await bumpVersion('permission-group');
        return result;
    }

    /**
     * Delete a permission group
     */
    async deleteGroup(id: string) {
        const group = await PermissionGroup.findById(id);
        if (!group) throw new Error('Permission group not found');
        const result = await PermissionGroup.findByIdAndDelete(id);
        await bumpVersion('permission-group');
        return result;
    }
}

export const permissionGroupService = new PermissionGroupService();
