const rateLimit = require('express-rate-limit');
const Redis = require('ioredis');
const { RedisStore } = require('rate-limit-redis');
const logger = require('./logger');


const redisClient = new Redis(process.env.REDIS_URI);
const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 60, // limit each IP to 60 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn('Sensitive endpoints exceeded for IP', req.ip);
        res.status(429).json({
            success: false,
            message: "Too many requests",
        });
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    }),
});



module.exports = { rateLimiter};