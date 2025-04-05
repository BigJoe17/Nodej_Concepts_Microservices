require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet');
const Redis = require('ioredis');
const express = require('express');
const { RedisStore } = require('rate-limit-redis');
const { rateLimit } = require('express-rate-limit');
const logger = require('./utils/logger');
const proxy = require('express-http-proxy');
const errorHandler = require('./middleware/errorhandler');
const { validateToken } = require('./middleware/authmiddleware');
const app = express();

const PORT = process.env.PORT || 3000;
const REDIS_PORT = process.env.REDIS_URL || 6379;

const redisClient = new Redis(REDIS_PORT);

redisClient.on('error', (error) => {
    logger.error('Redis client error occurred!', error);
});

redisClient.on('connect', () => {
    logger.info('Connected to Redis');
});

app.use(cors());
app.use(helmet());
app.use(express.json());

// Rate limiting
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

app.use((req, res, next) => {
    logger.info(`Received ${req.method} - ${req.url}`);
    logger.info(`Request Body: ${JSON.stringify(req.body)}`);
    next();
});

const proxyOptions = {
    proxyReqPathResolver: function (req) {
        return req.originalUrl.replace(/^\/v1/, '/api');
    },
    proxyErrorHandler: function (err, res, next) {
        logger.error(err);
        res.status(500).json({
            message: "Internal Server Error", error: err.message
        });
    },
};

app.use('/v1/auth', proxy(process.env.IDENTITY_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers['Content-Type'] = "application/json";
        return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(`Received ${proxyRes.statusCode} from Identity Service`);
        return proxyResData;
    }
}));

app.use('/v1/posts', validateToken, proxy(process.env.POST_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers['Content-Type'] = "application/json";
        proxyReqOpts.headers['x-user-id'] = srcReq.user.userId;
        return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(`Received ${proxyRes.statusCode} from Post Service`);
        return proxyResData;
    },
}));

app.use('/v1/media', validateToken, proxy(process.env.MEDIA_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers['x-user-id'] = srcReq.user.userId;

        // Safely check if Content-Type exists and starts with 'multipart/form-data'
        if (srcReq.headers['content-type'] && srcReq.headers['content-type'].startsWith('multipart/form-data')) {
            proxyReqOpts.headers['Content-Type'] = srcReq.headers['content-type'];
        } else {
            proxyReqOpts.headers['Content-Type'] = "application/json";
        }

        return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(`Received ${proxyRes.statusCode} from Media Service`);
        return proxyResData;
    },
    parseReqBody: false, // Disable body parsing for multipart/form-data
}));

app.use('/v1/search', validateToken, proxy(process.env.SEARCH_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers['Content-Type'] = "application/json";
        proxyReqOpts.headers['x-user-id'] = srcReq.user.userId;
        return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(`Received ${proxyRes.statusCode} from Post Service`);
        return proxyResData;
    },
}));


app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Identity Service is running on port ${process.env.IDENTITY_SERVICE_URL}`);
    logger.info(`Post Service is running on port ${process.env.POST_SERVICE_URL}`);
    logger.info(`Media Service is running on port ${process.env.MEDIA_SERVICE_URL}`);
    logger.info(`Search  Service is running on port ${process.env.SEARCH_SERVICE_URL}`);

    logger.info(`Redis is running on port ${REDIS_PORT}`);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled rejection at ', promise, 'reason:', reason);
});