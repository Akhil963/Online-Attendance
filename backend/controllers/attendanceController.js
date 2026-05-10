const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const moment = require('moment');

const parseLocation = (location) => {
  if (!location || typeof location !== 'object') {
    return null;
  }

  const latitude = Number(location.latitude);
  const longitude = Number(location.longitude);
  const accuracy = location.accuracy == null ? null : Number(location.accuracy);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  const displayName = typeof location.displayName === 'string' ? location.displayName.trim() : '';
  const city = typeof location.city === 'string' ? location.city.trim() : '';
  const village = typeof location.village === 'string' ? location.village.trim() : '';
  const state = typeof location.state === 'string' ? location.state.trim() : '';
  const country = typeof location.country === 'string' ? location.country.trim() : '';

  return {
    latitude,
    longitude,
    accuracy: Number.isFinite(accuracy) ? accuracy : null,
    displayName,
    city,
    village,
    state,
    country,
    capturedAt: new Date()
  };
};

const getOpenAttendanceForEmployee = async (employeeId) => {
  return Attendance.findOne({
    employeeId,
    checkInTime: { $ne: null },
    checkOutTime: null
  }).sort({ checkInTime: -1 });
};

const resolveWorkingHours = (attendanceRecord) => {
  if (!attendanceRecord?.checkInTime) {
    return 0;
  }

  if (attendanceRecord.checkOutTime) {
    return typeof attendanceRecord.workingHours === 'number'
      ? attendanceRecord.workingHours
      : moment(attendanceRecord.checkOutTime).diff(moment(attendanceRecord.checkInTime), 'hours', true);
  }

  return moment().diff(moment(attendanceRecord.checkInTime), 'hours', true);
};

// Mark attendance (Check In)
exports.checkIn = async (req, res) => {
  try {
    const employeeId = req.userId;
    const checkInLocation = parseLocation(req.body?.location);

    const openAttendance = await getOpenAttendanceForEmployee(employeeId);
    if (openAttendance) {
      return res.status(400).json({
        error: 'You are already checked in. Please check out before starting a new check-in.',
        attendance: {
          _id: openAttendance._id,
          date: openAttendance.date,
          checkInTime: openAttendance.checkInTime,
          checkOutTime: openAttendance.checkOutTime,
          workingHours: resolveWorkingHours(openAttendance)
        }
      });
    }

    const today = moment().startOf('day').toDate();
    const tomorrow = moment(today).add(1, 'day').toDate();

    let attendance = await Attendance.findOne({
      employeeId,
      date: { $gte: today, $lt: tomorrow }
    });

    if (!attendance) {
      attendance = new Attendance({
        employeeId,
        date: today,
        checkInTime: new Date(),
        checkInLocation,
        status: 'present'
      });
    } else if (!attendance.checkInTime) {
      attendance.checkInTime = new Date();
      attendance.checkInLocation = checkInLocation;
      attendance.status = 'present';
    }

    await attendance.save();

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      // Emit specific check-in event
      io.emit('attendance:checked-in', {
        employeeId,
        checkInTime: attendance.checkInTime,
        checkInLocation: attendance.checkInLocation,
        date: attendance.date
      });
      // Also emit to admin room
      io.to('admin').emit('attendance:checked-in', {
        employeeId,
        checkInTime: attendance.checkInTime,
        checkInLocation: attendance.checkInLocation,
        date: attendance.date
      });
      // Emit general update event for dashboard refresh
      io.emit('attendance:updated', {
        type: 'checkIn',
        employeeId,
        checkInTime: attendance.checkInTime,
        checkInLocation: attendance.checkInLocation,
        date: attendance.date
      });
      io.to('admin').emit('attendance:updated', {
        type: 'checkIn',
        employeeId,
        checkInTime: attendance.checkInTime,
        checkInLocation: attendance.checkInLocation,
        date: attendance.date
      });
      // Emit stats update for dashboard
      io.emit('stats:updated', { type: 'attendance' });
    }

    res.json({
      message: 'Check in successful',
      attendance: {
        checkInTime: attendance.checkInTime,
        checkInLocation: attendance.checkInLocation,
        date: attendance.date
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark attendance (Check Out)
exports.checkOut = async (req, res) => {
  try {
    const employeeId = req.userId;
    const checkOutLocation = parseLocation(req.body?.location);
    const attendance = await getOpenAttendanceForEmployee(employeeId);

    if (!attendance) {
      return res.status(400).json({ error: 'No active check in record found' });
    }

    attendance.checkOutTime = new Date();
    attendance.checkOutLocation = checkOutLocation;
    
    // Calculate working hours
    if (attendance.checkInTime) {
      const checkIn = moment(attendance.checkInTime);
      const checkOut = moment(attendance.checkOutTime);
      attendance.workingHours = checkOut.diff(checkIn, 'hours', true);
    }

    await attendance.save();

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      // Emit specific check-out event
      io.emit('attendance:checked-out', {
        employeeId,
        checkOutTime: attendance.checkOutTime,
        checkOutLocation: attendance.checkOutLocation,
        workingHours: attendance.workingHours,
        date: attendance.date
      });
      // Also emit to admin room
      io.to('admin').emit('attendance:checked-out', {
        employeeId,
        checkOutTime: attendance.checkOutTime,
        checkOutLocation: attendance.checkOutLocation,
        workingHours: attendance.workingHours,
        date: attendance.date
      });
      // Emit general update event for dashboard refresh
      io.emit('attendance:updated', {
        type: 'checkOut',
        employeeId,
        checkOutTime: attendance.checkOutTime,
        checkOutLocation: attendance.checkOutLocation,
        workingHours: attendance.workingHours,
        date: attendance.date
      });
      io.to('admin').emit('attendance:updated', {
        type: 'checkOut',
        employeeId,
        checkOutTime: attendance.checkOutTime,
        checkOutLocation: attendance.checkOutLocation,
        workingHours: attendance.workingHours,
        date: attendance.date
      });
      // Emit stats update for dashboard
      io.emit('stats:updated', { type: 'attendance' });
    }

    res.json({
      message: 'Check out successful',
      attendance: {
        checkOutTime: attendance.checkOutTime,
        checkOutLocation: attendance.checkOutLocation,
        workingHours: attendance.workingHours,
        date: attendance.date
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get attendance history for employee
exports.getAttendanceHistory = async (req, res) => {
  try {
    const { month, year } = req.query;
    const employeeId = req.userId;

    let startDate = moment().startOf('month').toDate();
    let endDate = moment().endOf('month').toDate();

    if (month && year) {
      startDate = moment(`${year}-${month}`, 'YYYY-MM').startOf('month').toDate();
      endDate = moment(`${year}-${month}`, 'YYYY-MM').endOf('month').toDate();
    }

    const attendance = await Attendance.find({
      employeeId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    const normalizedAttendance = attendance.map((record) => {
      const entry = record.toObject();
      entry.workingHours = resolveWorkingHours(record);
      return entry;
    });

    res.json({ attendance: normalizedAttendance, month, year });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get today's attendance
exports.getTodayAttendance = async (req, res) => {
  try {
    const employeeId = req.userId;
    const today = moment().startOf('day').toDate();
    const tomorrow = moment(today).add(1, 'day').toDate();

    let attendance = await Attendance.findOne({
      employeeId,
      date: { $gte: today, $lt: tomorrow }
    });

    if (!attendance) {
      attendance = await getOpenAttendanceForEmployee(employeeId);
    }

    const attendanceResponse = attendance
      ? {
          ...attendance.toObject(),
          workingHours: resolveWorkingHours(attendance)
        }
      : null;

    res.json({ attendance: attendanceResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all employees attendance (Admin)
exports.getAllAttendance = async (req, res) => {
  try {
    const { month, year, departmentId } = req.query;

    let startDate = moment().startOf('month').toDate();
    let endDate = moment().endOf('month').toDate();

    if (month && year) {
      startDate = moment(`${year}-${month}`, 'YYYY-MM').startOf('month').toDate();
      endDate = moment(`${year}-${month}`, 'YYYY-MM').endOf('month').toDate();
    }

    let query = {
      date: { $gte: startDate, $lte: endDate }
    };

    if (departmentId) {
      const employees = await Employee.find({ department: departmentId });
      const employeeIds = employees.map(e => e._id);
      query.employeeId = { $in: employeeIds };
    }

    const attendance = await Attendance.find(query)
      .populate('employeeId', 'name employeeId')
      .sort({ date: 1 });

    const normalizedAttendance = attendance.map((record) => {
      const entry = record.toObject();
      entry.workingHours = resolveWorkingHours(record);
      return entry;
    });

    res.json({ attendance: normalizedAttendance, month, year });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
