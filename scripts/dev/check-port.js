
import http from 'http';

const check = () => {
    const req = http.request({
        host: 'localhost',
        port: 5000,
        path: '/api/v1',
        method: 'GET'
    }, (res) => {
        console.log('Status:', res.statusCode);
    });

    req.on('error', (e) => {
        console.log('Error:', e.message);
    });

    req.end();
};
check();
