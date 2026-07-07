/**
 * Logger sederhana dengan timestamp & level.
 * Bisa diganti dengan winston/pino di masa depan tanpa mengubah pemanggilnya.
 */
const levels = { INFO: 'INFO', WARN: 'WARN', ERROR: 'ERROR' };

function log(level, message, meta) {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  // eslint-disable-next-line no-console
  console.log(`[${timestamp}] [${level}] ${message}${metaStr}`);
}

module.exports = {
  info: (msg, meta) => log(levels.INFO, msg, meta),
  warn: (msg, meta) => log(levels.WARN, msg, meta),
  error: (msg, meta) => log(levels.ERROR, msg, meta),
};
