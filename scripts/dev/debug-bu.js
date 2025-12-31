import mongoose from 'mongoose';
import fs from 'fs';

const DB_URL = "mongodb+srv://signature-bangla-pos:eIp2AjvGMDqTR48y@cluster0.mpromdu.mongodb.net/signature-bangla-pos?appName=Cluster0";

async function run() {
    try {
        await mongoose.connect(DB_URL);

        const bu = await mongoose.connection.collection('businessunits').findOne({ slug: 'pharmacy' });

        const output = {};

        if (!bu) {
            output.status = "NOT_FOUND";
        } else {
            output.status = "FOUND";
            output.name = bu.branding?.name;
            output.id = bu._id;
            output.features = bu.features;
            output.attributeGroupsRaw = bu.attributeGroups;
            output.attributeGroupLegacy = bu.attributeGroup;

            if (bu.attributeGroups && bu.attributeGroups.length > 0) {
                const groups = await mongoose.connection.collection('attributegroups').find({
                    _id: { $in: bu.attributeGroups }
                }).toArray();
                output.resolvedGroups = groups;
            }
        }

        fs.writeFileSync('debug_output.json', JSON.stringify(output, null, 2));
        console.log("Done.");

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
