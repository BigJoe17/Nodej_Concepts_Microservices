const logger = require("../utils/loggers");
const Post = require("../models/post");
const { validateCreatePost } = require("../utils/validation");
const { cache } = require("joi");


 async function  invalidatePostCache( req, input) {
  const cacheKey = `posts:${input}`;
 await req.redisClient.del(cacheKey);

  const keys = await  req.redisClient.keys('posts:*');

  if(keys.length > 0){
    await req.redisClient.del(keys);
  }

 }


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
    await invalidatePostCache(req, newlyCreatedPost._id.toString());
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
    const page = req.query.page || 1
    const limit = req.query.limit || 10
    const startIndex = (page - 1) * limit

    const cachedKey = `posts-${page}:${limit}`
    const cachedPosts = await req.redisClient.get(cachedKey)

    if (cachedPosts) {
      return res.json(JSON.parse(cachedPosts))
    }

    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

      const totalNoOfPosts = await Post.countDocuments()

      const result ={
         posts, 
         currentpage: page,
         totaPage: Math.ceil(totalNoOfPosts / limit),
         totalPosts : totalNoOfPosts
      }


      // save this to cache
      await req.redisClient.setex(cachedKey, 300, JSON.stringify(result));

       res.json(result );

  } catch (q) {
    logger.error(`Error getting all post : ${e.message}`);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};

const getPost = async (req, res) => {
  try {

    const PostId = req.params.id;
    const cacheKey = `posts:${PostId}`;
    const cachedPost = await req.redisClient.get(cacheKey);

    if(cachedPost){
      return res.json(JSON.parse(cachedPost));

    }

    const singlePostDetailsById = await Post.findById(PostId);

    if(!singlePostDetailsById){
      return res.status(404)
      .json({
         message: "Post not found", 
         success: false 
        });
    }

    await req.redisClient.setex(cacheKey, 300, JSON.stringify(singlePostDetailsById))
    return res.json(singlePostDetailsById);

    


  } catch (e) {
    logger.error(`Error getting post : ${e.message}`);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};

const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const deletedPost = await Post.findByIdAndDelete(postId);

    if (!deletedPost) {
      return res.status(404).json({
        message: "Post not found",
        success: false
      });
    }

    // Ensure invalidatePostCache is properly defined and works
    await invalidatePostCache(req, postId);

    return res.json({
      message: "Post deleted successfully",
      success: true
    });

  } catch (e) {
    logger.error(`Error deleting Post: ${e.message}`);
    return res.status(500).json({ 
      message: "Internal Server Error", 
      success: false 
    });
  }
};


module.exports = {
  createPost,
  getAllPost,
  getPost,
  deletePost,
};
