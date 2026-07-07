/**
 * Service utama AI Screening.
 * Bertugas:
 * 1. Memilih provider AI sesuai AI_PROVIDER di .env ("openai" atau "claude")
 * 2. Memanggil provider tersebut
 * 3. Membersihkan & mem-parsing hasilnya jadi JSON yang valid
 * 4. Menormalisasi skor supaya konsisten (0-100, ada scoreLabel yang benar)
 *
 * Kalau nanti ingin menambah provider baru (misal Gemini), cukup:
 * - Buat file baru di services/ai/xxxProvider.js dengan fungsi analyze() yang sama
 * - Tambahkan case baru di getProvider() di bawah
 * Tidak perlu ubah controller atau kode lain.
 */
const env = require('../config/env');
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');
const openaiProvider = require('./ai/openaiProvider');
const claudeProvider = require('./ai/claudeProvider');
const geminiProvider = require('./ai/geminiProvider');

function getProvider(providerName) {
  const name = (providerName || env.AI_PROVIDER || 'gemini').toLowerCase();

  switch (name) {
    case 'openai':
      return openaiProvider;
    case 'claude':
      return claudeProvider;
    case 'gemini':
      return geminiProvider;
    default:
      throw ApiError.badRequest(
        `AI provider "${name}" tidak dikenali. Gunakan "openai", "claude", atau "gemini".`
      );
  }
}

function scoreLabelFromScore(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Average';
  return 'Needs Improvement';
}

/**
 * Membersihkan response AI dari kemungkinan markdown code fence (```json ... ```)
 * yang kadang tetap disisipkan oleh model walau sudah diminta JSON murni.
 */
function stripMarkdownFence(text) {
  return text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}

function parseAndNormalize(rawText) {
  let parsed;
  try {
    parsed = JSON.parse(stripMarkdownFence(rawText));
  } catch (error) {
    logger.error('Gagal parsing JSON dari AI', { rawText: rawText.slice(0, 500) });
    throw ApiError.internal(
      'AI mengembalikan format yang tidak valid. Silakan coba screening ulang.'
    );
  }

  const score = Math.max(0, Math.min(100, Math.round(Number(parsed.overallScore) || 0)));

  return {
    overallScore: score,
    scoreLabel: parsed.scoreLabel || scoreLabelFromScore(score),
    categoryScores: Array.isArray(parsed.categoryScores) ? parsed.categoryScores : [],
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
    detailedAnalysis: parsed.detailedAnalysis || '',
    missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords : [],
    recommendedKeywords: Array.isArray(parsed.recommendedKeywords) ? parsed.recommendedKeywords : [],
    improvementSuggestions: Array.isArray(parsed.improvementSuggestions)
      ? parsed.improvementSuggestions
      : [],
    atsRecommendations: parsed.atsRecommendations || {},
  };
}

/**
 * @param {string} cvText - hasil ekstraksi teks CV (dari fileParserService)
 * @param {string} [targetPosition] - posisi pekerjaan yang dilamar (opsional)
 * @param {string} [providerOverride] - override provider untuk request ini saja
 */
async function screenCV(cvText, targetPosition, providerOverride) {
  const provider = getProvider(providerOverride);
  const providerName = providerOverride || env.AI_PROVIDER;

  logger.info('Memulai AI screening', { provider: providerName, textLength: cvText.length });

  let rawResponse;
  try {
    rawResponse = await provider.analyze(cvText, targetPosition);
  } catch (error) {
    if (error.isApiError) throw error;
    logger.error('AI provider error', { provider: providerName, message: error.message });
    throw ApiError.internal(
      `Gagal menghubungi layanan AI (${providerName}). Periksa API key dan kuota Anda.`
    );
  }

  if (!rawResponse) {
    throw ApiError.internal('AI tidak mengembalikan respons. Coba lagi.');
  }

  return parseAndNormalize(rawResponse);
}

module.exports = { screenCV };
