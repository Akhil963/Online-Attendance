/**
 * Password Validation Utility for Production Security
 */

const validatePasswordStrength = (password) => {
  const errors = [];
  
  // Length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter (A-Z)');
  }
  
  // Lowercase check
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter (a-z)');
  }
  
  // Number check
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number (0-9)');
  }
  
  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength: calculateStrength(password)
  };
};

const calculateStrength = (password) => {
  let strength = 0;
  
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  if (password.length >= 16) strength += 10;
  if (/[a-z]/.test(password)) strength += 15;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 15;
  
  return {
    percentage: Math.min(strength, 100),
    level: strength < 40 ? 'weak' : strength < 70 ? 'medium' : 'strong'
  };
};

const compareNewWithPrevious = (newPassword, previousPasswordHash) => {
  // In production, you would compare the new password hash with stored password
  // This prevents users from using the same password
  const bcrypt = require('bcryptjs');
  return bcrypt.compareSync(newPassword, previousPasswordHash);
};

module.exports = {
  validatePasswordStrength,
  calculateStrength,
  compareNewWithPrevious
};
