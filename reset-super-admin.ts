
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.join(__dirname, '.env') });

const resetPassword = async () => {
    try {
        if (!process.env.DB_URL) {
            throw new Error('DB_URL not found in .env');
        }
        await mongoose.connect(process.env.DB_URL);
        console.log('✅ Connected to MongoDB');

        // Dynamically load User model to ensure schema hooks (bcrypt) are active
        const { User } = await import('./src/app/modules/iam/user/user.model.ts');

        const email = process.env.SUPER_ADMIN_EMAIL || 'superadmin@gmail.com';
        const password = process.env.SUPER_ADMIN_PASS || '@$Abcde12345$@';

        const user = await User.findOne({ email });

        if (!user) {
            console.error('❌ Super Admin User not found via email:', email);
            process.exit(1);
        }

        console.log(`👤 Found user: ${user.email} (ID: ${user.id})`);

        // Force update password. 
        // The pre-save hook in user.model.ts will automaticall hash this.
        user.password = password;

        await user.save();

        console.log('✅ Password successfully updated and hashed!');
        console.log('Password set to:', password);

        process.exit(0);

    } catch (error) {
        console.error('❌ Error resetting password:', error);
        process.exit(1);
    }
};

resetPassword();
