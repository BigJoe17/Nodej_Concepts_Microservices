const express = require('express');
const { authenticateRequest } = require('../middleware/authMiddleware');

const { createPost, getPosts, getPost, updatePost, deletePost } = require('../controllers/post-controller');

const router = express.Router();


router.use(authenticateRequest);
router.post('/create-post', createPost);

module.exports = router;