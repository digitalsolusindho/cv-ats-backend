const express = require('express');
const { analyzeCV } = require('../controllers/screeningController');
const { validateScreeningInput } = require('../middleware/validateScreeningInput');
const { screeningLimiter } = require('../middleware/rateLimiter');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/analyze', authMiddleware, screeningLimiter, validateScreeningInput, analyzeCV);

module.exports = router;
