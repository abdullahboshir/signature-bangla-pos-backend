
const login = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'superadmin@gmail.com',
                password: '@$Abcde12345$@'
            })
        });

        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Data:', JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('Error:', error.message);
    }
};

login();
