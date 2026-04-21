const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  accuracy: {
    type: Number,
    default: null
  },
  displayName: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  village: {
    type: String,
    default: ''
  },
  state: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: ''
  },
  capturedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true  // Index for frequent employee queries
  },
  date: {
    type: Date,
    required: true,
    index: true  // Index for date-based queries
  },
  checkInTime: {
    type: Date,
    default: null
  },
  checkOutTime: {
    type: Date,
    default: null
  },
  checkInLocation: {
    type: locationSchema,
    default: null
  },
  checkOutLocation: {
    type: locationSchema,
    default: null
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'weekly_off', 'planned_leave', 'unplanned_leave'],
    default: 'absent'
  },
  workingHours: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
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

// Create compound index for employee and date
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
