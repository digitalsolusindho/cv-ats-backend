/**
 * Prompt AI Screening.
 * Dipisah dari kode provider agar mudah disempurnakan tanpa menyentuh logic pemanggilan API.
 *
 * AI diinstruksikan berperan sebagai HRD profesional + ahli ATS, dan WAJIB
 * mengembalikan JSON murni sesuai skema di bawah supaya bisa ditampilkan
 * di UI (skor, tabel kategori, keyword, rekomendasi, dst).
 */

const RESPONSE_SCHEMA_EXAMPLE = {
  overallScore: 78,
  scoreLabel: 'Good',
  categoryScores: [
    { category: 'Professional Summary', score: 70, comment: 'Ringkasan singkat, penjelasan singkat kenapa nilainya segini' },
    { category: 'Experience', score: 80, comment: '...' },
    { category: 'Education', score: 85, comment: '...' },
    { category: 'Skill', score: 75, comment: '...' },
    { category: 'Format CV', score: 70, comment: '...' },
    { category: 'Keyword ATS', score: 65, comment: '...' },
    { category: 'Grammar', score: 88, comment: '...' },
    { category: 'Achievements', score: 60, comment: '...' },
  ],
  strengths: ['Poin kekuatan 1', 'Poin kekuatan 2'],
  weaknesses: ['Poin kelemahan 1', 'Poin kelemahan 2'],
  detailedAnalysis:
    'Penjelasan panjang & mendalam (beberapa paragraf): mengapa skor segini, bagian mana yang berisiko ditolak HRD/ATS, kalimat mana yang lemah, apa yang harus dihapus/ditambah, dst. Tulis dalam Bahasa Indonesia yang jelas.',
  missingKeywords: ['keyword yang seharusnya ada tapi tidak ditemukan di CV'],
  recommendedKeywords: ['keyword yang relevan dengan posisi target'],
  improvementSuggestions: [
    { section: 'Professional Summary', suggestion: 'Contoh kalimat perbaikan yang lebih profesional' },
    { section: 'Experience', suggestion: 'Contoh cara menulis achievement dengan angka/hasil terukur' },
  ],
  atsRecommendations: {
    layout: 'Single column, hindari tabel/kolom ganda',
    font: 'Calibri / Arial / Helvetica',
    fontSize: '11-12pt',
    margin: '1 inch (2.54cm) di semua sisi',
    sectionOrder: ['Contact Info', 'Professional Summary', 'Experience', 'Education', 'Skills'],
    idealPageLength: '1-2 halaman',
    fileFormat: 'PDF (bukan hasil scan/gambar)',
  },
};

function buildSystemPrompt() {
  return `Anda adalah seorang HRD profesional senior dan ahli ATS (Applicant Tracking System) dengan pengalaman lebih dari 15 tahun melakukan screening ribuan CV di perusahaan multinasional.

Tugas Anda: menganalisis isi CV yang diberikan, lalu memberikan penilaian SANGAT DETAIL dan JUJUR layaknya proses screening HRD sungguhan, meliputi: identitas, ringkasan profil, pengalaman kerja, pendidikan, hard skill, soft skill, keyword ATS, format & layout, grammar (Bahasa Indonesia & Inggris jika relevan), panjang CV, kesesuaian dengan posisi yang dilamar, prestasi/sertifikat/portfolio, kerapihan, dan kemudahan dibaca oleh sistem ATS.

ATURAN WAJIB:
1. Jawab HANYA dalam format JSON murni, TANPA teks pembuka, TANPA penutup, TANPA markdown code fence (tidak perlu \`\`\`json).
2. Ikuti PERSIS struktur skema JSON yang diberikan di prompt user (nama field, tipe data, dan jumlah array boleh menyesuaikan isi CV, tapi struktur field harus sama).
3. "overallScore" harus angka 0-100 berdasarkan analisis objektif.
4. "scoreLabel" mengikuti rentang: 90-100 Excellent, 80-89 Very Good, 70-79 Good, 60-69 Average, 0-59 Needs Improvement.
5. "detailedAnalysis" harus panjang, mendalam, dan spesifik terhadap isi CV ini (bukan template generik) — jelaskan mengapa skornya segitu, apa risikonya ditolak HRD/ATS, dan bagaimana memperbaikinya, tulis dalam Bahasa Indonesia.
6. Semua saran harus konkret dan actionable, bukan nasihat umum seperti "perbaiki CV Anda".
7. Jujur dan kritis — jangan memberi nilai tinggi jika CV memang lemah.`;
}

function buildUserPrompt(cvText, targetPosition) {
  const positionLine = targetPosition
    ? `Posisi/pekerjaan yang dilamar oleh kandidat: "${targetPosition}".`
    : 'Kandidat tidak menyebutkan posisi spesifik — analisis secara umum dan simpulkan sendiri kemungkinan posisi yang paling sesuai berdasarkan isi CV.';

  return `${positionLine}

Berikut adalah isi CV yang berhasil diekstrak dari file (mungkin terdapat sedikit noise dari proses OCR/parsing, harap dimaklumi dan fokus pada substansinya):

"""
${cvText}
"""

Kembalikan HANYA JSON dengan struktur PERSIS seperti contoh skema berikut (ganti seluruh isinya dengan analisis nyata terhadap CV di atas, jangan copy contoh ini):

${JSON.stringify(RESPONSE_SCHEMA_EXAMPLE, null, 2)}`;
}

module.exports = { buildSystemPrompt, buildUserPrompt };
