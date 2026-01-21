const express = require('express');
const router = express.Router();
const { isWeeklyOff, getWeeklyOffsForMonth, GOVERNMENT_HOLIDAYS } = require('../utils/weeklyOffService');
const { authMiddleware } = require('../middleware/auth');

/**
 * Get all government holidays
 */
router.get('/holidays', authMiddleware, (req, res) => {
  try {
    res.json({
      holidays: GOVERNMENT_HOLIDAYS
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get weekly offs for a specific month
 * Query params: month (1-12), year
 */
router.get('/weekly-offs', authMiddleware, (req, res) => {
  try {
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }

    const weeklyOffs = getWeeklyOffsForMonth(parseInt(month), parseInt(year));
    
    res.json({
      month: parseInt(month),
      year: parseInt(year),
      weeklyOffs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Check if a specific date is weekly off
 * Query params: date (YYYY-MM-DD format)
 */
router.get('/check/:date', authMiddleware, (req, res) => {
  try {
    const { date } = req.params;
    const result = isWeeklyOff(new Date(date));
    
    res.json({
      date,
      ...result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
