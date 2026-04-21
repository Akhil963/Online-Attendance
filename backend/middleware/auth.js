const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id || !decoded?.role) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    const Model = decoded.role === 'admin' || decoded.role === 'superadmin' ? Admin : Employee;
    const user = await Model.findById(decoded.id).select('_id isActive status');

    if (!user) {
      return res.status(401).json({ error: 'Account no longer exists. Please login again.' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ error: 'Account is inactive. Contact administrator.' });
    }

    if (decoded.role !== 'admin' && decoded.role !== 'superadmin' && user.status === 'inactive') {
      return res.status(403).json({ error: 'Employee account is inactive. Contact administrator.' });
    }

    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

module.exports = { authMiddleware, roleMiddleware };
