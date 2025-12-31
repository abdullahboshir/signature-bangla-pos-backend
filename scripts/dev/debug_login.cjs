const mongoose = require('mongoose');
let bcrypt;
try { bcrypt = require('bcrypt'); } catch (e) { bcrypt = require('bcryptjs'); }

const DB_URL = "mongodb+srv://signature-bangla-pos:eIp2AjvGMDqTR48y@cluster0.mpromdu.mongodb.net/signature-bangla-pos?appName=Cluster0";

// Minimal schema to match
const UserSchema = new mongoose.Schema({
    email: String,
    password: { type: String, select: false },
}, { strict: false });

UserSchema.statics.isPasswordMatched = async function (plainText, hashedPass) {
    console.log("Checking password:", plainText, hashedPass);
    return await bcrypt.compare(plainText, hashedPass);
};

const User = mongoose.model('User', UserSchema);

async function main() {
    try {
        await mongoose.connect(DB_URL);
        console.log("Connected");

        const email = 'superadmin@gmail.com';
        const pass = '@$Abcde12345$@';

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            console.log("User not found");
        } else {
            console.log("User found:", user._id);
            console.log("Hash:", user.password);

            try {
                const isMatch = await User.isPasswordMatched(pass, user.password);
                console.log("Is Match:", isMatch);
            } catch (e) {
                console.error("Match error:", e);
            }
        }
    } catch (e) {
        console.error("Global error:", e);
    } finally {
        await mongoose.disconnect();
    }
}
main();
