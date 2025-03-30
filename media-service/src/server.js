require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const mediaRoutes = require("./routes/media-routes");
const logger = require("./utils/logger");
const { rateLimiter } = require("./utils/rateLimiting");
const  {authenticateRequest}  = require("./middlewares/authMiddleware");
const errorHandler = require("./middlewares/errorHandler");
// const multer = require("multer");



const app = express();

const PORT = process.env.PORT || 3003;  

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    logger.info("Connected to MongoDB");
}
).catch((error) => {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
});

app.use(cors());    
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
    logger.info(`Request received ${req.method} ${req.url}`);
    logger.info(`Request method: ${req.method}, Request URL: ${req.url}`);
    next();

});


// rate limiting middleware



app.use("/api/media",authenticateRequest, mediaRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`Media service is running on port ${PORT}`);
});


process.on("unhandledRejection", (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    process.exit(1);
});