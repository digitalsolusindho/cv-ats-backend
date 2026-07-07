/**
 * Root router. Setiap modul fitur (auth, cv, screening, dst) didaftarkan di sini
 * supaya app.js tetap bersih dan mudah dikembangkan.
 */
const express = require('express');
const authRoutes = require('./authRoutes');
const cvRoutes = require('./cvRoutes');
const screeningRoutes = require('./screeningRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/cv', cvRoutes);
router.use('/screening', screeningRoutes);

// Health check sederhana untuk memastikan server & deployment berjalan
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'CV ATS Screening HRD API is running' });
});

module.exports = router;
