
import fs from 'fs';

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
        fs.writeFileSync('response.json', JSON.stringify(data, null, 2));
        console.log('Response saved to response.json');
    } catch (error) {
        console.error('Error:', error.message);
    }
};
login();
