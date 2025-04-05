const logger = require("../utils/loggers");
const Post = require("../models/post");
const { validateCreatePost } = require("../utils/validation");
const Joi = require("joi");
const { publishEvent } = require("../utils/rabbitmq");

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
    console.log("newlyCreatedPost", newlyCreatedPost);


    await publishEvent("post.created", {
      postId: newlyCreatedPost._id.toString(),
      userId: newlyCreatedPost.user.toString(),
      content: newlyCreatedPost.content,
      createdAt: newlyCreatedPost.createdAt,
      mediaIds: newlyCreatedPost.mediaIds,
    });

    await invalidatePostCache(req, newlyCreatedPost._id.toString());
    logger.info("Post created successfully", newlyCreatedPost);
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
    logger.error(`Error getting all post : ${ q.message}`);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};

const getPost = async (req, res) => {
  try {

    const PostId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(PostId)) {
      return res.status(400).json({
        message: "Invalid Post ID",
        success: false,
      });
    }
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
    const post  = await Post.findByIdAndDelete({
      _id: postId,
      user: req.user._id,
    });
    console.log("userId", req.user);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false
      });
    }


    console.log("post deleted", post);
  
    await publishEvent("post.deleted",  {
      
      postId: post._id.toString(),
      mediaIds: post.mediaIds,
      userId: req.user._id
    });
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
