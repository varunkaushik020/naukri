const { createClient } = require('redis');

let redisClient = null;
let redisAvailable = false;

const connectRedis = async () => {
    try {
        if (!process.env.REDIS_URL) {
            console.log('âš ï¸  Redis URL not configured - using in-memory fallback for MFA');
            redisAvailable = false;
            return null;
        }

        if (!redisClient) {
            redisClient = createClient({
                url: process.env.REDIS_URL,
            });

            redisClient.on('error', (err) => {
                console.warn('âš ï¸  Redis Client Error:', err.message);
                redisAvailable = false;
            });

            redisClient.on('connect', () => {
                console.log('âœ… Redis Connected Successfully');
                redisAvailable = true;
            });

            await redisClient.connect();
        }

        return redisClient;
    } catch (error) {
        console.error(`âš ï¸  Error connecting to Redis: ${error.message}`);
        console.warn('âš ï¸  Continuing without Redis - MFA will use console logging');
        redisAvailable = false;
        return null;
    }
};

const getRedisClient = () => {
    return redisClient;
};

const isRedisAvailable = () => {
    return redisAvailable;
};

module.exports = { connectRedis, getRedisClient, isRedisAvailable };
