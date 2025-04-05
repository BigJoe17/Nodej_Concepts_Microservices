const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadMedia, getAllMedia } = require("../controllers/media-controllers");
const { authenticateRequest } = require("../middlewares/authMiddleware");
const logger = require("../utils/logger");

// Multer configuration (Memory Storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
}).single("file");

// ✅ Fix 1: Move Content-Type Check Before Multer
router.use((req, res, next) => {
  const contentType = req.headers["content-type"];

  if (!contentType || !contentType.startsWith("multipart/form-data")) {
    logger.warn("Invalid Content-Type header");
    return res.status(400).json({
      message: "Content-Type must be multipart/form-data",
      success: false,
    });
  }

  next();
});

// ✅ Fix 2: Apply Multer First, Then Authenticate, Then Controller
router.post("/upload", authenticateRequest, (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      logger.error("Multer error while uploading: ", err);
      return res.status(400).json({
        message: "Error uploading file",
        error: err.message,
        stack: err.stack,
      });
    } else if (err) {
      logger.error("Unknown error while uploading: ", err);
      return res.status(500).json({
        message: "Unknown error occurred",
        error: err.message,
        stack: err.stack,
      });
    }
    if (!req.file) {
      logger.warn("No media file provided");
      return res.status(400).json(
        {
          message: "No media file provided",
          success: false
        });
    }

    next();
  });

}, uploadMedia);

router.get("/get", authenticateRequest, getAllMedia);

module.exports = router;
