const express = require('express');
const {searchPostController} = require('../controllers/search-controller');
const logger = require('../utils/loggers');
const {authenticateRequest} = require('../middleware/authMiddleware')


const router = express.Router();

router.use(authenticateRequest);

router.get('/posts', searchPostController);

module.exports = router;

