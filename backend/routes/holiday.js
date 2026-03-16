const express = require('express');
const { randomUUID } = require('crypto');
const router = express.Router();
const { isWeeklyOff, getWeeklyOffsForMonth, GOVERNMENT_HOLIDAYS } = require('../utils/weeklyOffService');
const { authMiddleware } = require('../middleware/auth');

const normalizeHoliday = (holiday) => ({
  _id: holiday._id || randomUUID(),
  name: (holiday.name || '').trim(),
  date: holiday.date,
  description: holiday.description || '',
  type: holiday.type || 'national'
});

const isValidDate = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date);

for (let index = 0; index < GOVERNMENT_HOLIDAYS.length; index++) {
  GOVERNMENT_HOLIDAYS[index] = normalizeHoliday(GOVERNMENT_HOLIDAYS[index]);
}

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
 * Create a holiday
 */
router.post('/', authMiddleware, (req, res) => {
  try {
    const { name, date, description, type } = req.body || {};

    if (!name || !name.trim() || !date) {
      return res.status(400).json({ message: 'Holiday name and date are required' });
    }

    if (!isValidDate(date)) {
      return res.status(400).json({ message: 'Date must be in YYYY-MM-DD format' });
    }

    const duplicate = GOVERNMENT_HOLIDAYS.find((holiday) => holiday.date === date && holiday.name.toLowerCase() === name.trim().toLowerCase());
    if (duplicate) {
      return res.status(409).json({ message: 'Holiday already exists for this date' });
    }

    const holiday = normalizeHoliday({ name, date, description, type });
    GOVERNMENT_HOLIDAYS.push(holiday);

    res.status(201).json({
      message: 'Holiday created successfully',
      holiday
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Update a holiday
 */
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const holidayIndex = GOVERNMENT_HOLIDAYS.findIndex((holiday) => holiday._id === id);

    if (holidayIndex === -1) {
      return res.status(404).json({ message: 'Holiday not found' });
    }

    const { name, date, description, type } = req.body || {};
    if (!name || !name.trim() || !date) {
      return res.status(400).json({ message: 'Holiday name and date are required' });
    }

    if (!isValidDate(date)) {
      return res.status(400).json({ message: 'Date must be in YYYY-MM-DD format' });
    }

    const duplicate = GOVERNMENT_HOLIDAYS.find((holiday) => holiday._id !== id && holiday.date === date && holiday.name.toLowerCase() === name.trim().toLowerCase());
    if (duplicate) {
      return res.status(409).json({ message: 'Holiday already exists for this date' });
    }

    const updatedHoliday = normalizeHoliday({
      ...GOVERNMENT_HOLIDAYS[holidayIndex],
      name,
      date,
      description,
      type
    });

    GOVERNMENT_HOLIDAYS[holidayIndex] = updatedHoliday;

    res.json({
      message: 'Holiday updated successfully',
      holiday: updatedHoliday
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Delete a holiday
 */
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const holidayIndex = GOVERNMENT_HOLIDAYS.findIndex((holiday) => holiday._id === id);

    if (holidayIndex === -1) {
      return res.status(404).json({ message: 'Holiday not found' });
    }

    const [deletedHoliday] = GOVERNMENT_HOLIDAYS.splice(holidayIndex, 1);
    res.json({
      message: 'Holiday deleted successfully',
      holiday: deletedHoliday
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
