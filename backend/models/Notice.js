const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['announcement', 'meeting', 'policy', 'event', 'urgent'],
    default: 'announcement'
  },
  priority: {
    type: String,
    enum: ['normal', 'high', 'critical'],
    default: 'normal'
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  departments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  }],
  employees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }],
  roles: [{
    type: String,
    enum: ['employee', 'manager', 'director', 'admin']
  }],
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  postedByModel: {
    type: String,
    enum: ['Admin', 'Employee'],
    default: 'Admin'
  },
  attachments: [{
    name: String,
    url: String
  }],
  notificationChannels: [{
    type: String,
    enum: ['dashboard', 'email', 'whatsapp'],
    default: 'dashboard'
  }],
  sentAt: {
    type: Date,
    default: null
  },
  failedRecipients: [{
    employeeId: mongoose.Schema.Types.ObjectId,
    email: String,
    phone: String,
    channel: String,
    error: String,
    timestamp: Date
  }],
  sentToCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiryDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notice', noticeSchema);
