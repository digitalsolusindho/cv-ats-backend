/**
 * Provider AI: Claude (Anthropic).
 * Struktur return HARUS sama dengan openaiProvider.js (string JSON mentah)
 * supaya aiService.js bisa memakai provider manapun tanpa perlu tahu bedanya.
 */
const Anthropic = require('@anthropic-ai/sdk');
const env = require('../../config/env');
const ApiError = require('../../utils/ApiError');
const { buildSystemPrompt, buildUserPrompt } = require('./atsPrompt');

async function analyze(cvText, targetPosition) {
  if (!env.CLAUDE_API_KEY) {
    throw ApiError.internal(
      'CLAUDE_API_KEY belum diatur di backend/.env. Tambahkan API key Claude terlebih dahulu.'
    );
  }

  const client = new Anthropic({ apiKey: env.CLAUDE_API_KEY });

  const message = await client.messages.create({
    model: env.CLAUDE_MODEL,
    max_tokens: 4096,
    temperature: 0.4,
    system: buildSystemPrompt(),
    messages: [{ role: 'user', content: buildUserPrompt(cvText, targetPosition) }],
  });

  const textBlock = message.content?.find((block) => block.type === 'text');
  return textBlock?.text || '';
}

module.exports = { analyze };
