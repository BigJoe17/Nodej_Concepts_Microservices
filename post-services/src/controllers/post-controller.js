const logger = require("../utils/loggers");
const Post = require("../models/post");
const { validateCreatePost } = require("../utils/validation");

const createPost = async (req, res) => {
  logger.info("Create Post endpoint hit...");

  try {
    const { error } = validateCreatePost(req.body);
    if (error) {
      logger.warn(`Validation Error: ${error.details[0].message}`);
      return res
        .status(400)
        .json({ message: error.details[0].message, success: false });
    }
    const { content, mediaIds } = req.body;
    const newlyCreatedPost = new Post({
      user: req.user._id,
      content,
      mediaIds: mediaIds || [],
    });

    await newlyCreatedPost.save();
    logger.info("Post created successfully");
    res.status(201).json({
      message: "Post created successfully",
      success: true,
      data: newlyCreatedPost,
    });
  } catch (e) {
    logger.error(`Error: ${e.message}`);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};

const getAllPost = async (req, res) => {
  try {
  } catch (q) {
    logger.error(`Error getting all post : ${e.message}`);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};

const getPost = async (req, res) => {
  try {
      
    const page = req.query.page || 1
    const limit = req.query.limit || 10
    const startIndex = (page - 1) * limit 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
  } catch (e) {
    logger.error(`Error getting post : ${e.message}`);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};

const deletePost = async (req, res) => {
  try {
  } catch (e) {
    logger.error(`Error deleting Post : ${e.message}`);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};

module.exports = {
  createPost,
  getAllPost,
  getPost,
  deletePost,
};
