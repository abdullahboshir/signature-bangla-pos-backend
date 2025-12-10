
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const listBUs = async () => {
    try {
        const tokenPath = path.join(__dirname, 'token.txt');
        if (!fs.existsSync(tokenPath)) {
            console.error('Token file not found');
            return;
        }
        const token = fs.readFileSync(tokenPath, 'utf8').trim();

        const response = await fetch('http://localhost:5000/api/v1/super-admin/business-unit', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        console.log('Keys:', Object.keys(data));
        console.log('Data Type:', typeof data.data);
        console.log('Full Data:', JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('Error:', error.message);
    }
};
listBUs();
