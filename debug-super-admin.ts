
import mongoose from 'mongoose';
import { User } from './src/app/modules/iam/user/user.model.ts';
import { Role } from './src/app/modules/iam/role/role.model.ts';
import { USER_ROLE } from './src/app/modules/iam/user/user.constant.ts';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL as string);
        console.log('Connected to DB');
    } catch (err) {
        console.error('DB Connection Failed', err);
        process.exit(1);
    }
};

const debugSuperAdmin = async () => {
    await connectDB();

    try {
        console.log(`Searching for Role: ${USER_ROLE.SUPER_ADMIN}`);
        const superAdminRole = await Role.findOne({ name: USER_ROLE.SUPER_ADMIN });

        if (!superAdminRole) {
            console.error('CRITICAL: Super Admin Role NOT FOUND!');
        } else {
            console.log('Super Admin Role Found:', superAdminRole._id, superAdminRole.name);

            const superAdminUser = await User.findOne({
                roles: { $in: [superAdminRole._id] }
            });

            if (!superAdminUser) {
                console.error('CRITICAL: No User found with Super Admin Role!');

                // Detailed check
                const allUsers = await User.find({}).populate('roles');
                console.log(`Total Users: ${allUsers.length}`);
                allUsers.forEach(u => {
                    console.log(`User: ${u.email}, Roles: ${u.roles.map((r: any) => r.name || r)}`);
                });
            } else {
                console.log('Super Admin User Found:', superAdminUser.email, superAdminUser._id);
            }
        }
    } catch (error) {
        console.error('Error in debug script:', error);
    } finally {
        await mongoose.disconnect();
    }
};

debugSuperAdmin();
