const express = require('express');
const { login, logout, getCurrentUser } = require('../controllers/authController');
const { validateLoginInput } = require('../middleware/validateRequest');
const { loginLimiter } = require('../middleware/rateLimiter');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', loginLimiter, validateLoginInput, login);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;
