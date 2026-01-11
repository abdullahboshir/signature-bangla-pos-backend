import mongoose from 'mongoose';
import { Role } from './src/app/modules/iam/role/role.model.ts';
import { PermissionGroup } from './src/app/modules/iam/permission-group/permission-group.model.ts';
import dotenv from 'dotenv';

dotenv.config();

async function check() {
    await mongoose.connect(process.env.DATABASE_URL as string);
    console.log("Connected to DB");

    const ownerRole = await Role.findOne({ name: 'company-owner' }).populate('permissionGroups');
    if (!ownerRole) {
        console.log("Role not found");
        process.exit(1);
    }

    console.log("Role:", ownerRole.name);
    console.log("Groups:", ownerRole.permissionGroups.map((g: any) => g.name));

    const shareholderGroup = await PermissionGroup.findOne({ name: 'governance.shareholder' }).populate('permissions');
    console.log("Shareholder Group Permissions Count:", shareholderGroup?.permissions.length);
    if (shareholderGroup) {
        console.log("Sample Permissions:", shareholderGroup.permissions.slice(0, 5).map((p: any) => p.id));
    }

    process.exit(0);
}

check();
