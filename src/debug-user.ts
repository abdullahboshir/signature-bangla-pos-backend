import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcrypt';
import fs from 'fs';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const dbUrl = process.env.DB_URL;
const logFile = path.join(process.cwd(), 'src', 'debug_log.txt');

function log(msg: string) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n', 'utf8');
}

// Clear log file
fs.writeFileSync(logFile, '', 'utf8');

async function run() {
    try {
        if (!dbUrl) throw new Error('DB_URL is missing');
        await mongoose.connect(dbUrl);
        log('Connected to DB');

        const UserSchema = new mongoose.Schema({}, { strict: false });
        const User = mongoose.models.User || mongoose.model('User', UserSchema);

        const users = await User.find({}).lean();

        let found = false;
        for (const u of users as any[]) {
            if (u.email && u.email.includes('gmail.com')) {
                found = true;
                log(`\nUser: ${u.email}`);
                const pass = u.password;
                log(`Hash: ${pass}`);

                if (!pass) {
                    log('Password field is MISSING or empty.');
                    continue;
                }

                if (pass.startsWith('$2')) {
                    const match123456 = await bcrypt.compare('123456', pass);
                    log(`Matches '123456': ${match123456}`);

                    const matchAdmin = await bcrypt.compare('admin', pass);
                    log(`Matches 'admin': ${matchAdmin}`);

                    const matchPass = await bcrypt.compare('password', pass);
                    log(`Matches 'password': ${matchPass}`);
                } else {
                    log('Password is NOT a valid bcrypt hash (does not start with $2).');
                }
            }
        }
        if (!found) log('No users found with gmail.com');

    } catch (err) {
        log('Error: ' + err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
