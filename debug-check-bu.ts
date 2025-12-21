
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.join(process.cwd(), '.env') });

const dbUrl = process.env.DATABASE_URL || "mongodb://localhost:27017/signature-bangla-pos";

async function run() {
    try {
        await mongoose.connect(dbUrl);
        console.log("Connected to DB");

        const collection = mongoose.connection.collection('businessunits');
        const docs = await collection.find({}).toArray();

        console.log("--- FOUND BUSINESS UNITS ---");
        docs.forEach(doc => {
            console.log(`Name: ${doc.name}`);
            console.log(`_id: ${doc._id}`);
            console.log(`id: ${doc.id}`);
            console.log(`slug: ${doc.slug}`);
            console.log("----------------------------");
        });

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

run();
