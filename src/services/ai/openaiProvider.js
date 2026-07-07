/**
 * Provider AI: OpenAI.
 * Setiap provider WAJIB punya fungsi `analyze(cvText, targetPosition)` yang
 * mengembalikan STRING JSON mentah dari AI (parsing/validasi dilakukan di aiService.js).
 */
const OpenAI = require('openai');
const env = require('../../config/env');
const ApiError = require('../../utils/ApiError');
const { buildSystemPrompt, buildUserPrompt } = require('./atsPrompt');

async function analyze(cvText, targetPosition) {
  if (!env.OPENAI_API_KEY) {
    throw ApiError.internal(
      'OPENAI_API_KEY belum diatur di backend/.env. Tambahkan API key OpenAI terlebih dahulu.'
    );
  }

  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

  const completion = await client.chat.completions.create({
    model: env.OPENAI_MODEL,
    temperature: 0.4,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: buildSystemPrompt() },
      { role: 'user', content: buildUserPrompt(cvText, targetPosition) },
    ],
  });

  return completion.choices?.[0]?.message?.content || '';
}

module.exports = { analyze };
