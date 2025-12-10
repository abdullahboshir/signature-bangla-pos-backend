
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sleep = ms => new Promise(r => setTimeout(r, ms));

const createCategory = async () => {
    // await sleep(2000); 
    try {
        const tokenPath = path.join(__dirname, 'token.txt');
        if (!fs.existsSync(tokenPath)) {
            console.error('Token file not found at:', tokenPath);
            return;
        }
        const token = fs.readFileSync(tokenPath, 'utf8').trim();
        const payload = {
            name: "TestCategory_Final_" + Date.now(),
            businessUnit: "STR_01KBAZDK3K9611WEJZN04KGBJE_BU", // Testing the Custom ID Resolution Logic
            isActive: true,
            description: "Test description final"
        };

        console.log('Testing Category Creation with Custom ID:', payload.businessUnit);

        const response = await fetch('http://localhost:5000/api/v1/super-admin/categories/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
};
createCategory();
