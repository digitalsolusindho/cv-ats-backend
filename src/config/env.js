/**
 * Konfigurasi environment terpusat.
 * Semua akses process.env HARUS lewat file ini,
 * supaya mudah dicek & tidak berserakan di banyak file.
 */
require('dotenv').config();

function required(name, fallback = undefined) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    // eslint-disable-next-line no-console
    console.warn(`[ENV WARNING] Variable "${name}" belum di-set di file .env`);
  }
  return value;
}

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

  JWT_SECRET: required('JWT_SECRET', 'dev_secret_change_me'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30m',

  GOOGLE_APPS_SCRIPT_URL: required('GOOGLE_APPS_SCRIPT_URL'),
  APPS_SCRIPT_SECRET: required('APPS_SCRIPT_SECRET', ''),

  AI_PROVIDER: process.env.AI_PROVIDER || 'gemini',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  CLAUDE_API_KEY: process.env.CLAUDE_API_KEY || '',
  CLAUDE_MODEL: process.env.CLAUDE_MODEL || 'claude-sonnet-4-6',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.5-flash',

  RATE_LIMIT_WINDOW_MINUTES: parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || '15', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '20', 10),
  OCR_LANGUAGES: process.env.OCR_LANGUAGES || 'eng+ind',

  isProd() {
    return this.NODE_ENV === 'production';
  },
};

module.exports = env;
