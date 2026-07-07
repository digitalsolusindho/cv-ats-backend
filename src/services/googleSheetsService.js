/**
 * Service yang bertugas komunikasi dengan Google Spreadsheet.
 *
 * PENTING: Backend TIDAK mengakses Spreadsheet secara langsung.
 * Backend memanggil sebuah "Google Apps Script Web App" (lihat folder /apps-script)
 * yang sudah di-deploy dan mengetahui cara membaca Spreadsheet tersebut.
 *
 * Keuntungan pendekatan ini untuk pemula:
 * - Tidak perlu setup Google Cloud Service Account / OAuth yang rumit
 * - Admin cukup edit baris di Spreadsheet, tidak perlu sentuh kode sama sekali
 */
const axios = require('axios');
const env = require('../config/env');
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

const client = axios.create({
  baseURL: env.GOOGLE_APPS_SCRIPT_URL,
  timeout: 10000,
});

/**
 * Memvalidasi username & password terhadap Spreadsheet.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{ valid: boolean, status: string, username: string }>}
 */
async function verifyCredentials(username, password) {
  try {
    const response = await client.get('', {
      params: {
        action: 'login',
        username,
        password,
        secret: env.APPS_SCRIPT_SECRET,
      },
    });

    const result = response.data;

    // Kontrak response yang diharapkan dari Apps Script (Code.gs):
    // { success: true, found: true, status: "Active" }  -> user ditemukan & password cocok
    // { success: true, found: false }                    -> tidak ditemukan / password salah
    // { success: false, message: "..." }                 -> error di sisi Apps Script

    if (!result || result.success !== true) {
      logger.error('Apps Script mengembalikan response tidak valid', { result });
      throw ApiError.internal('Gagal memverifikasi akun. Coba lagi nanti.');
    }

    if (!result.found) {
      return { valid: false, status: null, username };
    }

    return {
      valid: result.status === 'Active',
      status: result.status,
      username,
    };
  } catch (error) {
    if (error.isApiError) throw error;
    logger.error('Gagal menghubungi Google Apps Script', { message: error.message });
    throw ApiError.internal(
      'Tidak dapat menghubungi layanan autentikasi. Periksa konfigurasi Google Apps Script.'
    );
  }
}

module.exports = { verifyCredentials };
