import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    try {
        await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/signature-bangla-pos');
        console.log("Connected to DB");

        const Role = mongoose.connection.collection('roles');
        const PermissionGroup = mongoose.connection.collection('permissiongroups');

        const role = await Role.findOne({ name: 'company-owner' });
        if (!role) {
            console.log("Role 'company-owner' not found");
        } else {
            console.log("OWNER ROLE:", role.name);
            console.log("GROUP IDs:", role.permissionGroups);

            const groups = await PermissionGroup.find({ _id: { $in: role.permissionGroups } }).toArray();
            console.log("GROUP NAMES:", groups.map(g => g.name));
        }
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}
run();
