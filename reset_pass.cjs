const mongoose = require('mongoose');
let bcrypt;
try {
    bcrypt = require('bcrypt');
} catch (e) {
    try {
        bcrypt = require('bcryptjs');
    } catch (e2) {
        console.error("No bcrypt found");
        process.exit(1);
    }
}

const DB_URL = "mongodb+srv://signature-bangla-pos:eIp2AjvGMDqTR48y@cluster0.mpromdu.mongodb.net/signature-bangla-pos?appName=Cluster0";

const UserSchema = new mongoose.Schema({
    email: String,
    password: String,
}, { strict: false });

const User = mongoose.model('User', UserSchema);

async function main() {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(DB_URL);
        console.log("Connected");

        const user = await User.findOne({ email: 'superadmin@gmail.com' });
        if (!user) {
            console.log("User not found");
        } else {
            console.log("User found:", user._id);
            const salt = await bcrypt.genSalt(12);
            const hash = await bcrypt.hash('@$Abcde12345$@', salt);

            await User.updateOne({ _id: user._id }, { $set: { password: hash } });
            console.log("Password updated via updateOne");
        }
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}
main();
