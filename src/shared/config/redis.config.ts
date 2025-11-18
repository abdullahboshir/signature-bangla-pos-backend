import { createClient, type RedisClientType } from 'redis';
import config from './app.config.js';

const redisUrl = config.redis_url || 'redis://localhost:6379'; 

const client: RedisClientType = createClient({
    url: redisUrl,
});

client.on('error', (err) => console.error('Redis Client Error', err));


async function connectRedis() {
    try {
        await client.connect();
        console.log('✅ Connected to Redis successfully!');
    } catch (err) {
        console.error('❌ Failed to connect to Redis:', err);
        // Exit process if Redis is crucial for the app (like session store)
        // process.exit(1); 
    }
}

connectRedis();

export default client;