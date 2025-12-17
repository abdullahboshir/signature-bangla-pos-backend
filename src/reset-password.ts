import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcrypt';

dotenv.config({ path: path.join(process.cwd(), '.env') });
const dbUrl = process.env['DB_URL'];

async function run() {
    try {
        if (!dbUrl) throw new Error("DB_URL missing");
        await mongoose.connect(dbUrl);
        console.log('Connected to DB');

        // Hash '123456' with salt rounds 12 (matching the model's logic approx)
        const EncryptedPassword = await bcrypt.hash('123456', 12);

        const usersToReset = ['superadmin@gmail.com', 'customer1@gmail.com'];

        for (const email of usersToReset) {
            const res = await mongoose.connection.collection('users').updateOne(
                { email: email },
                { $set: { password: EncryptedPassword } }
            );
            console.log(`Reset password for ${email}: ${res.modifiedCount} document(s) updated.`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}
run();
