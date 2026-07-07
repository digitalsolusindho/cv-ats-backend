/**
 * Setup aplikasi Express: middleware global, routing, error handler.
 * File ini TIDAK menjalankan server (lihat server.js) supaya mudah dites (testing).
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const routes = require('./routes');
const { generalLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// --- Security headers ---
app.use(helmet());

// --- CORS: hanya izinkan frontend yang terdaftar ---
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

// --- Body parser ---
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// --- Logging request (format lebih ringkas saat production) ---
app.use(morgan(env.isProd() ? 'combined' : 'dev'));

// --- Rate limiting global ---
app.use('/api', generalLimiter);

// --- Routes utama ---
app.use('/api', routes);

// --- 404 handler ---
app.use(notFoundHandler);

// --- Global error handler (WAJIB paling akhir) ---
app.use(errorHandler);

module.exports = app;
