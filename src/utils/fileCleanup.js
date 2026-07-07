/**
 * Helper untuk menghapus file sementara di uploads/tmp setelah selesai diproses,
 * supaya disk tidak penuh oleh file-file lama.
 */
const fs = require('fs');
const logger = require('./logger');

function deleteTempFile(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) {
      logger.warn('Gagal menghapus file sementara', { filePath, message: err.message });
    }
  });
}

module.exports = { deleteTempFile };
