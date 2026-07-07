/**
 * Middleware sanitasi & validasi input untuk endpoint login.
 * Mencegah input kosong, terlalu panjang, atau mengandung karakter berbahaya.
 */
const validator = require('validator');
const ApiError = require('../utils/ApiError');

function validateLoginInput(req, res, next) {
  const { username, password } = req.body || {};

  if (!username || !password) {
    throw ApiError.badRequest('Username dan password wajib diisi');
  }

  if (typeof username !== 'string' || typeof password !== 'string') {
    throw ApiError.badRequest('Format input tidak valid');
  }

  const cleanUsername = validator.trim(username);
  const cleanPassword = password; // password tidak di-trim agar spasi sengaja tetap dihitung

  if (cleanUsername.length < 3 || cleanUsername.length > 50) {
    throw ApiError.badRequest('Username harus 3-50 karakter');
  }

  if (cleanPassword.length < 3 || cleanPassword.length > 100) {
    throw ApiError.badRequest('Password harus 3-100 karakter');
  }

  // Escape untuk mencegah karakter yang bisa dipakai injection pada log/response
  req.body.username = validator.escape(cleanUsername);
  req.body.password = cleanPassword;

  next();
}

module.exports = { validateLoginInput };
