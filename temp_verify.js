const main = async () => {
    try {
        console.log("Attempting login...");
        const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'superadmin@gmail.com', password: '@$Abcde12345$@' })
        });
        
        console.log("Login status:", loginRes.status);
        const text = await loginRes.text();
        console.log("Raw Login Response:", text);
        
        let loginData;
        try {
            loginData = JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse login JSON");
            return;
        }

        if (loginData.success && loginData.data?.accessToken) {
            console.log("Login successful. Fetching Business Units...");
            const token = loginData.data.accessToken;
            const buRes = await fetch('http://localhost:5000/api/v1/super-admin/business-unit', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const buData = await buRes.json();
            console.log('BU Response:', JSON.stringify(buData, null, 2));
        } else {
            console.log("Login failed or no token.");
        }
    } catch (e) {
        console.error("Script error:", e);
    }
}
main();
