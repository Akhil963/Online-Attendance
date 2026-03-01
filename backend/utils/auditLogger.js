/**
 * Audit Logging for Security Events
 */

const fs = require('fs');
const path = require('path');

const AUDIT_LOG_FILE = path.join(__dirname, '../logs/audit.log');
const EVENT_LOG_FILE = path.join(__dirname, '../logs/events.log');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logSecurityEvent = (eventType, userId, userType, details = {}, ipAddress = 'UNKNOWN', success = true) => {
  const timestamp = new Date().toISOString();
  
  const logEntry = {
    timestamp,
    eventType, // 'PASSWORD_RESET_REQUEST', 'PASSWORD_RESET_SUCCESS', 'PASSWORD_RESET_FAILED', 'PASSWORD_CHANGE', etc.
    userId,
    userType,
    success,
    ipAddress,
    details,
    userAgent: details.userAgent || 'UNKNOWN'
  };
  
  // Write to audit log
  const logLine = JSON.stringify(logEntry) + '\n';
  fs.appendFileSync(AUDIT_LOG_FILE, logLine, 'utf8');
  
  // Also log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[AUDIT] ${eventType}:`, logEntry);
  }
  
  return logEntry;
};

const logFailedAttempt = (email, userType, attemptType, ipAddress, reason = '') => {
  const timestamp = new Date().toISOString();
  
  const logEntry = {
    timestamp,
    email,
    userType,
    attemptType, // 'FORGOT_PASSWORD', 'RESET_PASSWORD', 'WEAK_PASSWORD', etc.
    ipAddress,
    reason
  };
  
  const logLine = JSON.stringify(logEntry) + '\n';
  fs.appendFileSync(EVENT_LOG_FILE, logLine, 'utf8');
  
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[ATTEMPT] ${attemptType} - ${email}:`, reason);
  }
  
  return logEntry;
};

const getRecentFailedAttempts = (email, userType, minutes = 60) => {
  try {
    if (!fs.existsSync(EVENT_LOG_FILE)) {
      return [];
    }
    
    const content = fs.readFileSync(EVENT_LOG_FILE, 'utf8');
    const lines = content.split('\n').filter(l => l.trim());
    
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
    
    return lines
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(entry => 
        entry && 
        entry.email === email && 
        entry.userType === userType &&
        new Date(entry.timestamp) > cutoffTime
      );
  } catch (error) {
    console.error('Error reading failed attempts:', error);
    return [];
  }
};

const logSecurityAlert = (alertType, details = {}) => {
  const timestamp = new Date().toISOString();
  
  const alertEntry = {
    timestamp,
    alertType, // 'BRUTE_FORCE_DETECTED', 'SUSPICIOUS_ACTIVITY', etc.
    details
  };
  
  // Send alert (could be to Sentry, email, Slack, etc.)
  console.error(`[SECURITY ALERT] ${alertType}:`, alertEntry);
  
  return alertEntry;
};

module.exports = {
  logSecurityEvent,
  logFailedAttempt,
  getRecentFailedAttempts,
  logSecurityAlert
};
