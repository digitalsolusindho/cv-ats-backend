/**
 * Provider AI: Google Gemini.
 * Dipakai lewat REST API langsung (tanpa SDK tambahan) supaya dependency tetap ringan.
 * Struktur return HARUS sama dengan provider lain (string JSON mentah).
 *
 * Gemini punya free tier tanpa kartu kredit (lihat backend/README/.env.example),
 * cocok untuk development & testing.
 */
const axios = require('axios');
const env = require('../../config/env');
const ApiError = require('../../utils/ApiError');
const logger = require('../../utils/logger');
const { buildSystemPrompt, buildUserPrompt } = require('./atsPrompt');

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

async function analyze(cvText, targetPosition) {
  if (!env.GEMINI_API_KEY) {
    throw ApiError.internal(
      'GEMINI_API_KEY belum diatur di backend/.env. Tambahkan API key Gemini terlebih dahulu.'
    );
  }

  const url = `${BASE_URL}/${env.GEMINI_MODEL}:generateContent`;

  try {
    const response = await axios.post(
      url,
      {
        system_instruction: { parts: [{ text: buildSystemPrompt() }] },
        contents: [{ role: 'user', parts: [{ text: buildUserPrompt(cvText, targetPosition) }] }],
        generationConfig: {
          temperature: 0.4,
          response_mime_type: 'application/json',
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': env.GEMINI_API_KEY,
        },
        timeout: 60000,
      }
    );

    const candidate = response.data?.candidates?.[0];
    const text = candidate?.content?.parts?.map((p) => p.text).join('') || '';
    return text;
  } catch (error) {
    const apiMessage = error.response?.data?.error?.message;
    logger.error('Gemini API error', { message: apiMessage || error.message });

    if (error.response?.status === 429) {
      throw ApiError.internal(
        'Batas gratis Gemini API tercapai untuk saat ini (rate limit). Tunggu sebentar lalu coba lagi.'
      );
    }
    if (error.response?.status === 403 || error.response?.status === 401) {
      throw ApiError.internal('API key Gemini tidak valid atau belum diaktifkan.');
    }

    throw ApiError.internal(apiMessage || 'Gagal menghubungi Gemini API.');
  }
}

module.exports = { analyze };
