/**
 * Controller AI Screening.
 * Menerima teks hasil ekstraksi CV (dari tahap Upload CV) + posisi target (opsional),
 * lalu meneruskannya ke aiService untuk dianalisis oleh AI.
 */
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const logger = require('../utils/logger');
const aiService = require('../services/aiService');

/**
 * POST /api/screening/analyze
 * Body: { cvText: string, targetPosition?: string, aiProvider?: 'openai' | 'claude' }
 */
const analyzeCV = asyncHandler(async (req, res) => {
  const { cvText, targetPosition, aiProvider } = req.body;

  const result = await aiService.screenCV(cvText, targetPosition, aiProvider);

  logger.info('AI screening selesai', {
    user: req.user?.username,
    score: result.overallScore,
  });

  return ApiResponse.success(res, result, 'Analisis AI selesai');
});

module.exports = { analyzeCV };
