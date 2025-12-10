
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const login = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'superadmin@gmail.com',
                password: '@$Abcde12345$@'
            })
        });
        const data = await response.json();

        // Handle double nesting: data.data.data.accessToken
        const token = data?.data?.data?.accessToken || data?.data?.accessToken || data?.accessToken;

        if (token) {
            const tokenPath = path.join(__dirname, 'token.txt');
            fs.writeFileSync(tokenPath, token);
            console.log('Token written to:', tokenPath);
        } else {
            console.log('Login failed. Token not found in response structure.');
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
};
login();
