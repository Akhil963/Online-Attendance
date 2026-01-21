const moment = require('moment');

// Government holidays for 2024-2026
const GOVERNMENT_HOLIDAYS = [
  // 2024
  { date: '2024-01-26', name: 'Republic Day' },
  { date: '2024-03-25', name: 'Holi' },
  { date: '2024-04-11', name: 'Eid ul-Fitr' },
  { date: '2024-04-17', name: 'Ram Navami' },
  { date: '2024-04-21', name: 'Mahavir Jayanti' },
  { date: '2024-05-23', name: 'Buddha Purnima' },
  { date: '2024-06-17', name: 'Eid ul-Adha' },
  { date: '2024-07-17', name: 'Muharram' },
  { date: '2024-08-15', name: 'Independence Day' },
  { date: '2024-08-26', name: 'Janmashtami' },
  { date: '2024-09-16', name: 'Milad un-Nabi' },
  { date: '2024-10-02', name: 'Gandhi Jayanti' },
  { date: '2024-10-12', name: 'Dussehra' },
  { date: '2024-10-31', name: 'Diwali' },
  { date: '2024-11-01', name: 'Diwali (Day 2)' },
  { date: '2024-11-15', name: 'Guru Nanak Jayanti' },
  { date: '2024-12-25', name: 'Christmas' },

  // 2025
  { date: '2025-01-26', name: 'Republic Day' },
  { date: '2025-03-14', name: 'Holi' },
  { date: '2025-04-11', name: 'Eid ul-Fitr' },
  { date: '2025-04-14', name: 'Ambedkar Jayanti' },
  { date: '2025-04-18', name: 'Good Friday' },
  { date: '2025-05-01', name: 'May Day' },
  { date: '2025-05-23', name: 'Buddha Purnima' },
  { date: '2025-06-20', name: 'Eid ul-Adha' },
  { date: '2025-07-07', name: 'Muharram' },
  { date: '2025-08-15', name: 'Independence Day' },
  { date: '2025-08-16', name: 'Janmashtami' },
  { date: '2025-09-16', name: 'Milad un-Nabi' },
  { date: '2025-10-02', name: 'Gandhi Jayanti' },
  { date: '2025-10-01', name: 'Dussehra' },
  { date: '2025-10-20', name: 'Diwali' },
  { date: '2025-10-21', name: 'Diwali (Day 2)' },
  { date: '2025-11-04', name: 'Guru Nanak Jayanti' },
  { date: '2025-12-25', name: 'Christmas' },

  // 2026
  { date: '2026-01-26', name: 'Republic Day' },
  { date: '2026-03-25', name: 'Holi' },
  { date: '2026-04-02', name: 'Eid ul-Fitr' },
  { date: '2026-04-10', name: 'Good Friday' },
  { date: '2026-04-14', name: 'Ambedkar Jayanti' },
  { date: '2026-05-01', name: 'May Day' },
  { date: '2026-05-24', name: 'Buddha Purnima' },
  { date: '2026-06-10', name: 'Eid ul-Adha' },
  { date: '2026-06-27', name: 'Muharram' },
  { date: '2026-08-15', name: 'Independence Day' },
  { date: '2026-09-05', name: 'Janmashtami' },
  { date: '2026-09-04', name: 'Milad un-Nabi' },
  { date: '2026-10-02', name: 'Gandhi Jayanti' },
  { date: '2026-10-20', name: 'Dussehra' },
  { date: '2026-11-08', name: 'Diwali' },
  { date: '2026-11-09', name: 'Diwali (Day 2)' },
  { date: '2026-11-23', name: 'Guru Nanak Jayanti' },
  { date: '2026-12-25', name: 'Christmas' }
];

/**
 * Check if a given date is a weekly off
 * Weekly off includes: Every Sunday, 2nd Saturday of month, Government Holidays
 * @param {Date} date - The date to check
 * @returns {Object} - { isWeeklyOff: boolean, reason: string }
 */
function isWeeklyOff(date) {
  const momentDate = moment(date);
  const dayOfWeek = momentDate.day(); // 0 = Sunday, 6 = Saturday
  const dateStr = momentDate.format('YYYY-MM-DD');

  // Check if Sunday
  if (dayOfWeek === 0) {
    return { isWeeklyOff: true, reason: 'Sunday' };
  }

  // Check if 2nd Saturday
  if (dayOfWeek === 6) { // Saturday
    const dayOfMonth = momentDate.date();
    // 2nd Saturday is between 8-14
    if (dayOfMonth >= 8 && dayOfMonth <= 14) {
      return { isWeeklyOff: true, reason: 'Second Saturday' };
    }
  }

  // Check if government holiday
  const holiday = GOVERNMENT_HOLIDAYS.find(h => h.date === dateStr);
  if (holiday) {
    return { isWeeklyOff: true, reason: `Government Holiday - ${holiday.name}` };
  }

  return { isWeeklyOff: false, reason: null };
}

/**
 * Get all weekly off dates for a given month and year
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @returns {Array} - Array of dates with weekly off status
 */
function getWeeklyOffsForMonth(month, year) {
  const weeklyOffs = [];
  const daysInMonth = moment(`${year}-${String(month).padStart(2, '0')}`, 'YYYY-MM').daysInMonth();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = moment(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, 'YYYY-MM-DD').toDate();
    const { isWeeklyOff, reason } = isWeeklyOff(date);
    
    if (isWeeklyOff) {
      weeklyOffs.push({
        date: moment(date).format('YYYY-MM-DD'),
        reason
      });
    }
  }

  return weeklyOffs;
}

module.exports = {
  isWeeklyOff,
  getWeeklyOffsForMonth,
  GOVERNMENT_HOLIDAYS
};
