/**
 * Controller untuk autentikasi: login, logout, & get current user.
 */
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const googleSheetsService = require('../services/googleSheetsService');
const logger = require('../utils/logger');

/**
 * POST /api/auth/login
 * Body: { username, password }
 */
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const result = await googleSheetsService.verifyCredentials(username, password);

  if (!result.status) {
    // Username tidak ditemukan / password salah.
    // Pesan digeneralisasi agar tidak membocorkan mana yang salah (security best practice).
    throw ApiError.unauthorized('Username atau password salah.');
  }

  if (result.status !== 'Active') {
    throw ApiError.forbidden(`Akun tidak aktif (status: ${result.status}). Hubungi admin.`);
  }

  const token = jwt.sign({ username: result.username }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  logger.info('User login berhasil', { username: result.username });

  return ApiResponse.success(res, {
    token,
    user: { username: result.username },
    expiresIn: env.JWT_EXPIRES_IN,
  }, 'Login berhasil');
});

/**
 * POST /api/auth/logout
 * Karena JWT bersifat stateless, logout cukup dilakukan di sisi client
 * (menghapus token). Endpoint ini disediakan untuk konsistensi API
 * dan tempat menambahkan token-blacklist di masa depan bila diperlukan.
 */
const logout = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, null, 'Logout berhasil');
});

/**
 * GET /api/auth/me
 * Mengembalikan info user yang sedang login (dari token yang valid).
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, { user: req.user }, 'OK');
});

module.exports = { login, logout, getCurrentUser };
