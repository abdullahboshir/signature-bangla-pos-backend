
import mongoose from 'mongoose';

const dbUrl = "mongodb+srv://signature-bangla-pos:eIp2AjvGMDqTR48y@cluster0.mpromdu.mongodb.net/signature-bangla-pos?appName=Cluster0";

async function run() {
    try {
        await mongoose.connect(dbUrl);
        console.log("Connected to DB");

        // Use 'businessunits' (Mongoose defaults to plural lowercase) or check 'BusinessUnit'
        // Let's try to list collections first to be sure
        const collection = mongoose.connection.collection('businessunits');
        const docs = await collection.find({}, { projection: { name: 1, slug: 1, id: 1, _id: 1 } }).toArray();

        console.log("--- BUSINESS UNITS LIST ---");
        docs.forEach(doc => {
            console.log(`[${doc.name}] slug='${doc.slug}' id='${doc.id}' _id='${doc._id}'`);
        });

        const clothing = docs.find(d => d.slug === 'clothing' || d.id === 'clothing');
        if (clothing) {
            console.log("\nFOUND 'clothing' MATCH:", clothing);
        } else {
            console.log("\nNO MATCH FOUND FOR 'clothing' (slug or id)");
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

run();
