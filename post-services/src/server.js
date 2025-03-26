require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const Redis = require("ioredis");
const postRoutes = require("./routes/post-routes");
const logger = require("./utils/loggers");
const errorHandler = require("./middleware/errorHandler");
const { authenticateRequest } = require("./middleware/authMiddleware");

const app = express();

const PORT = process.env.PORT || 3002;

mongoose.connect(process.env.MONGO_URI)
    .then(() => { logger.info('Connected to MongoDB') })
    .catch((err) => { logger.error('Mongodb Connection error', err) });

const redisClient = new Redis(process.env.REDIS_URI);

app.use(cors());
app.use(helmet());
app.use(express.json());


// Rate Limiter IP  Setup
app.use('/api/posts', authenticateRequest, (req, res, next) => {
         req.redisClient = redisClient;
         next();

}, postRoutes)

app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`post service  is running on port ${PORT}`);
});


process.on('unhandledRejection', (reason, promise) => {
    logger.error('unhandled rejection at ', promise, "reason:", reason);
});

//     windowMs: 15 * 60 * 1000,
//     max: 30,
//     standardHeaders: true,
//     legacyHeaders: false,
//     handler: (req, res) => {
//         logger.warn('Sensitive endpoints exceeded for IP', req.ip);
//         res.status(429).json({   
//             success: false,
//             message: "Too many requests",
//         });