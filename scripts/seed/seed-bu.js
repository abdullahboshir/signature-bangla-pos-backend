
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedBU = async () => {
    try {
        const tokenPath = path.join(__dirname, 'token.txt');
        if (!fs.existsSync(tokenPath)) {
            console.error('Token file not found');
            return;
        }
        const token = fs.readFileSync(tokenPath, 'utf8').trim();

        // 24 hex char dummy ID
        const dummyId = "507f1f77bcf86cd799439011";

        const payload = {
            name: "Test Business Unit",
            id: "STR_01KBAZDK3K9611WEJZN04KGBJE_BU",
            slug: "test-business-unit-str",
            contact: {
                email: "test@bu.com",
                phone: "1234567890"
            },
            branding: {
                name: "Test Brand",
                description: "Test Desc"
            },
            seo: {
                metaTitle: "Test",
                metaDescription: "Test"
            },
            primaryCategory: dummyId,
            categories: [dummyId]
        };

        console.log('Creating Business Unit...');
        const response = await fetch('http://localhost:5000/api/v1/super-admin/business-unit/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('SEED STATUS:', response.status);
        console.log('SEED DATA ID:', data?.data?.id || 'NO_ID');
        console.log('SEED SUCCESS:', data?.success);

    } catch (error) {
        console.error('Error:', error.message);
    }
};
seedBU();
