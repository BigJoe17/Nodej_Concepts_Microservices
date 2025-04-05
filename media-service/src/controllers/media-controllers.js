const logger = require("../utils/logger");
const Media = require("../models/media");
const { uploadMediaToCloudinary } = require("../utils/cloudinary");


const uploadMedia = async (req, res) => {
  logger.info("Starting media upload");

  try {
     console.log(req.file, "req.file");
      if (!req.file) {
          logger.warn("No media file provided");
          return res.status(400).json({ message: "No media file provided", success: false });
      }

      logger.info("Media file received");

      // console.log(req);
      const userId = req.headers['x-user-id'] // Extract userId from req.user
      
      const { originalname, mimetype, buffer} = req.file;
      if (!userId) {
          logger.error("User ID is missing from the request");
          return res.status(400).json({ message: "User ID is required", success: false });
      }

      logger.info(`File details: name=${originalname}, type=${mimetype}`);

      // Upload to Cloudinary
      logger.info("Uploading media to Cloudinary");
      const cloudinaryResult = await uploadMediaToCloudinary(req.file);

      logger.info(
          `Cloudinary upload successful. Public ID: ${cloudinaryResult.public_id}`
      );

      // Save media details to the database
      const newlyCreatedMedia = new Media({
          publicId: cloudinaryResult.public_id,
          originalName: originalname,
          userId: userId,
          mimeType: mimetype,
          url: cloudinaryResult.secure_url,
      });

      await newlyCreatedMedia.save();
      logger.info("Media details saved to the database");

      // Return success response
      return res.status(201).json({
          message: "Media file uploaded successfully",
          success: true,
          mediaId:newlyCreatedMedia._id,
          userId: userId,
        url : cloudinaryResult.secure_url,
      });
  } catch (err) {
      logger.error(`Error uploading media: ${err.message}`);
      return res
          .status(500)
          .json({ message: "Internal Server Error", success: false });
  }
};

const getAllMedia = async (req, res) => {
  try {
      const media = await Media.find({ userId: req.user._id });
      return res.status(200).json({
          message: "Media files retrieved successfully",
          success: true,
          data: media,
      });
  } catch (err) {
      logger.error(`Error retrieving media: ${err.message}`);
      return res
          .status(500)
          .json({ message: "Internal Server Error", success: false });
  }
};


module.exports = {
  uploadMedia,
  getAllMedia,
};
