/**
 * Entry point aplikasi. Bertugas menjalankan HTTP server.
 */
const app = require('./src/app');
const env = require('./src/config/env');
const logger = require('./src/utils/logger');

const server = app.listen(env.PORT, () => {
  logger.info(`Server berjalan di http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

// Penanganan error yang tidak tertangkap agar server tidak crash diam-diam
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection', { message: err.message });
  server.close(() => process.exit(1));
});
