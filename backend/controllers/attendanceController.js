const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const moment = require('moment');

// Mark attendance (Check In)
exports.checkIn = async (req, res) => {
  try {
    const employeeId = req.userId;
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
        status: 'present'
      });
    } else if (!attendance.checkInTime) {
      attendance.checkInTime = new Date();
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
        date: attendance.date
      });
      // Also emit to admin room
      io.to('admin').emit('attendance:checked-in', {
        employeeId,
        checkInTime: attendance.checkInTime,
        date: attendance.date
      });
      // Emit general update event for dashboard refresh
      io.emit('attendance:updated', {
        type: 'checkIn',
        employeeId,
        checkInTime: attendance.checkInTime,
        date: attendance.date
      });
      io.to('admin').emit('attendance:updated', {
        type: 'checkIn',
        employeeId,
        checkInTime: attendance.checkInTime,
        date: attendance.date
      });
      // Emit stats update for dashboard
      io.emit('stats:updated', { type: 'attendance' });
    }

    res.json({
      message: 'Check in successful',
      attendance: {
        checkInTime: attendance.checkInTime,
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
    const today = moment().startOf('day').toDate();
    const tomorrow = moment(today).add(1, 'day').toDate();

    const attendance = await Attendance.findOne({
      employeeId,
      date: { $gte: today, $lt: tomorrow }
    });

    if (!attendance) {
      return res.status(400).json({ error: 'No check in record found for today' });
    }

    attendance.checkOutTime = new Date();
    
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
        workingHours: attendance.workingHours,
        date: attendance.date
      });
      // Also emit to admin room
      io.to('admin').emit('attendance:checked-out', {
        employeeId,
        checkOutTime: attendance.checkOutTime,
        workingHours: attendance.workingHours,
        date: attendance.date
      });
      // Emit general update event for dashboard refresh
      io.emit('attendance:updated', {
        type: 'checkOut',
        employeeId,
        checkOutTime: attendance.checkOutTime,
        workingHours: attendance.workingHours,
        date: attendance.date
      });
      io.to('admin').emit('attendance:updated', {
        type: 'checkOut',
        employeeId,
        checkOutTime: attendance.checkOutTime,
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

    res.json({ attendance, month, year });
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

    const attendance = await Attendance.findOne({
      employeeId,
      date: { $gte: today, $lt: tomorrow }
    });

    res.json({ attendance });
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

    res.json({ attendance, month, year });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
