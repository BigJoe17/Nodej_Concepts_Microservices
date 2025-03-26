const express = require('express');
const { authenticateRequest } = require('../middleware/authMiddleware');

const { createPost, getAllPost, getPost, updatePost, deletePost } = require('../controllers/post-controller');

const router = express.Router();


router.use(authenticateRequest);
router.post('/create-post', createPost);
router.get('/all-posts', getAllPost);
router.get('/:id', getPost);
router.delete('/:id', deletePost);


module.exports = router;