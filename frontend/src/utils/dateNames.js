// Day names mapping with Hindi and Marathi translations
const DAY_NAMES = {
  'Monday': {
    english: 'Monday',
    hindi: 'सोमवार',
    marathi: 'सोमवार'
  },
  'Tuesday': {
    english: 'Tuesday',
    hindi: 'मंगलवार',
    marathi: 'मंगळवार'
  },
  'Wednesday': {
    english: 'Wednesday',
    hindi: 'बुधवार',
    marathi: 'बुधवार'
  },
  'Thursday': {
    english: 'Thursday',
    hindi: 'गुरुवार',
    marathi: 'गुरुवार'
  },
  'Friday': {
    english: 'Friday',
    hindi: 'शुक्रवार',
    marathi: 'शुक्रवार'
  },
  'Saturday': {
    english: 'Saturday',
    hindi: 'शनिवार',
    marathi: 'शनिवार'
  },
  'Sunday': {
    english: 'Sunday',
    hindi: 'रविवार',
    marathi: 'रविवार'
  }
};

const MONTH_NAMES = {
  'January': {
    english: 'January',
    hindi: 'जनवरी',
    marathi: 'जानेवारी'
  },
  'February': {
    english: 'February',
    hindi: 'फरवरी',
    marathi: 'फेब्रुवारी'
  },
  'March': {
    english: 'March',
    hindi: 'मार्च',
    marathi: 'मार्च'
  },
  'April': {
    english: 'April',
    hindi: 'अप्रैल',
    marathi: 'एप्रिल'
  },
  'May': {
    english: 'May',
    hindi: 'मई',
    marathi: 'मे'
  },
  'June': {
    english: 'June',
    hindi: 'जून',
    marathi: 'जून'
  },
  'July': {
    english: 'July',
    hindi: 'जुलाई',
    marathi: 'जुलै'
  },
  'August': {
    english: 'August',
    hindi: 'अगस्त',
    marathi: 'ऑगस्ट'
  },
  'September': {
    english: 'September',
    hindi: 'सितंबर',
    marathi: 'सप्टेंबर'
  },
  'October': {
    english: 'October',
    hindi: 'अक्टूबर',
    marathi: 'ऑक्टोबर'
  },
  'November': {
    english: 'November',
    hindi: 'नवंबर',
    marathi: 'नोव्हेंबर'
  },
  'December': {
    english: 'December',
    hindi: 'दिसंबर',
    marathi: 'डिसेंबर'
  }
};

/**
 * Get day name in specified language
 * @param {string} dayName - Day name in English
 * @param {string} language - Language code: 'en', 'hi', 'mr'
 * @returns {string} - Day name in specified language
 */
export const getDayName = (dayName, language = 'en') => {
  const day = DAY_NAMES[dayName];
  if (!day) return dayName;
  
  switch(language) {
    case 'hi':
      return day.hindi;
    case 'mr':
      return day.marathi;
    default:
      return day.english;
  }
};

/**
 * Get month name in specified language
 * @param {string} monthName - Month name in English
 * @param {string} language - Language code: 'en', 'hi', 'mr'
 * @returns {string} - Month name in specified language
 */
export const getMonthName = (monthName, language = 'en') => {
  const month = MONTH_NAMES[monthName];
  if (!month) return monthName;
  
  switch(language) {
    case 'hi':
      return month.hindi;
    case 'mr':
      return month.marathi;
    default:
      return month.english;
  }
};

/**
 * Format date with day and month names in specified language
 * @param {Date} date - Date to format
 * @param {string} language - Language code: 'en', 'hi', 'mr'
 * @returns {string} - Formatted date string
 */
export const formatDateWithDay = (date, language = 'en') => {
  const dayName = getDayName(new Date(date).toLocaleDateString('en-US', { weekday: 'long' }), language);
  const day = new Date(date).getDate();
  const monthName = getMonthName(new Date(date).toLocaleDateString('en-US', { month: 'long' }), language);
  const year = new Date(date).getFullYear();
  
  return `${dayName}, ${day} ${monthName} ${year}`;
};

export const DAY_NAMES_LIST = DAY_NAMES;
export const MONTH_NAMES_LIST = MONTH_NAMES;
