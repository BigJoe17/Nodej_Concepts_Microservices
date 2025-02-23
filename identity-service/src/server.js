const mongoose = require('mongoose');
const logger = require('./utils/logger');
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { RateLimiterRedis } = require('rate-limiter-flexible');
const Redis = require('ioredis');
const rateLimit = require('express-rate-limit');
const {RedisStore} = require('rate-limit-redis'); // Import RedisStore correctly
const routes = require('./routes/identity_service');
const errorHandler = require('./middleware/errorHandler');
const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => { logger.info('Connected to MongoDB') })
    .catch((err) => { logger.error('Mongodb Connection error', err) });

const redisClient = new Redis(process.env.REDIS_URI);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    logger.info(`Received ${req.method} - ${req.url}`);
    logger.info(`Request Body: ${JSON.stringify(req.body)}`);
    next();
});

// Rate Limiter Setup
const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'middleware',
    points: 5,
    duration: 1,
    blockDuration: 10
});

app.use((req, res, next) => {
    rateLimiter.consume(req.ip)
        .then(() => next())
        .catch(() => {
            logger.warn('Too many requests from IP', req.ip);
            res.status(429).json({
                success: false,
                message: "Too many requests",
            });
        });
});

// IP-based rate limiting for sensitive endpoints
const sensitiveEndpointsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
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

app.use('/api/auth/register', sensitiveEndpointsLimiter); // Correct route path

app.use('/api/auth', routes);

// Error Handler Middleware
app.use(errorHandler);

app.listen(process.env.PORT, () => {
    logger.info(`Server is running on port ${process.env.PORT}`);
});

process.on('unhandledRejection', (err, promise) => {
    logger.error(`UnhandledRejection at : ${promise} and reason: ${err}`);
    server.close(() => process.exit(1));
});
