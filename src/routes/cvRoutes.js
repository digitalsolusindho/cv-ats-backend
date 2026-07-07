const express = require('express');
const { uploadCV } = require('../controllers/cvController');
const { uploadSingleCV } = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/upload', authMiddleware, uploadSingleCV, uploadCV);

module.exports = router;
