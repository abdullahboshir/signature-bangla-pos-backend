import mongoose from 'mongoose';

const DB_URL = "mongodb+srv://signature-bangla-pos:eIp2AjvGMDqTR48y@cluster0.mpromdu.mongodb.net/signature-bangla-pos?appName=Cluster0";

async function run() {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(DB_URL);
        console.log("Connected.");

        const result = await mongoose.connection.collection('businessunits').updateOne(
            { slug: 'pharmacy' },
            { $set: { "features.hasAttributeGroups": true } }
        );

        console.log("Update Result:", result);

        if (result.modifiedCount > 0) {
            console.log("SUCCESS: Attribute Groups enabled for Pharmacy.");
        } else {
            console.log("WARNING: No document modified. It might already be true or BU not found.");
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
