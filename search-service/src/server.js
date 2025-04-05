require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const redis = require("ioredis");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/loggers");
const { connectToRabbitMQ } = require("./utils/rabbitmq");
const searchRoutes = require("./routes/search-routes");
const { consumeEvent } = require("./utils/rabbitmq");
const { handlePostCreated, handlePostDeleted} = require("./eventHandler/search-event-handler");

app = express();

const PORT = process.env.PORT || 3004;
const redisClient = new redis(process.env.REDIS_URI);

const connectTODB = () => {
    mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");
    }).catch((error) => {
        console.error(`Error connecting to MongoDB: ${error.message}`);
    })
}


// app.use(cors());
app.use(helmet());
app.use(express.json());


app.use((req, res, next) => {
    logger.info(`Request received ${req.method} ${req.url}`);
    logger.info(`Request method: ${req.method}, Request URL: ${req.url}`);
    next();
}
);




app.use("/api/search", searchRoutes);
app.use(errorHandler);


async function startServer() {
    try {
        await connectToRabbitMQ();

        console.log("Handled post : ", typeof handlePostCreated);

        await consumeEvent("post.created", handlePostCreated);
        await consumeEvent("post.deleted", handlePostDeleted);
        

        console.log("Event handlers set up successfully");


        app.listen(PORT, () => {
            logger.info(`search service  is running on port ${PORT}`);
            connectTODB();
        });
    } catch (error) {
        logger.error('Error starting server:', error);
        process.exit(1);
    }
}

startServer();

