const Department = require('../models/Department');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const moment = require('moment');
const ExcelJS = require('exceljs');
const { sendDailyAttendanceReport } = require('../utils/emailService');

// Get dashboard data for employee
exports.getDashboardData = async (req, res) => {
  try {
    const employeeId = req.userId;
    const { month, year } = req.query;

    let startDate = moment().startOf('month').toDate();
    let endDate = moment().endOf('month').toDate();

    if (month && year) {
      startDate = moment(`${year}-${month}`, 'YYYY-MM').startOf('month').toDate();
      endDate = moment(`${year}-${month}`, 'YYYY-MM').endOf('month').toDate();
    }

    console.log('📊 Dashboard Request:', {
      employeeId,
      month,
      year,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    // Get attendance data
    const attendance = await Attendance.find({
      employeeId,
      date: { $gte: startDate, $lte: endDate }
    });

    console.log(`✓ Found ${attendance.length} attendance records`);

    const present = attendance.filter(a => a.status === 'present').length;
    const weeklyOff = attendance.filter(a => a.status === 'weekly_off').length;
    const plannedLeaveFromAttendance = attendance.filter(a => a.status === 'planned_leave').length;
    const unplannedLeaveFromAttendance = attendance.filter(a => a.status === 'unplanned_leave').length;

    // Include approved "unplanned" Leave entries for this employee in the current month.
    // This makes the Unplanned Leave metric work even when unplanned leaves are tracked
    // only in the Leave collection and not as attendance status records.
    const unplannedLeaves = await Leave.find({
      employeeId,
      leaveType: 'unplanned',
      status: 'approved',
      startDate: { $lte: endDate },
      endDate: { $gte: startDate }
    }).select('startDate endDate numberOfDays');

    let unplannedLeaveFromLeaves = 0;
    unplannedLeaves.forEach(leave => {
      const leaveStart = moment.max(moment(leave.startDate).startOf('day'), moment(startDate).startOf('day'));
      const leaveEnd = moment.min(moment(leave.endDate).startOf('day'), moment(endDate).startOf('day'));
      const days = Math.max(0, leaveEnd.diff(leaveStart, 'days') + 1);
      unplannedLeaveFromLeaves += days;
    });

    // Avoid double counting for unplanned leaves: prefer whichever source has data
    const unplannedLeave = Math.max(unplannedLeaveFromAttendance, unplannedLeaveFromLeaves);

    // Include approved "planned" Leave entries for this employee in the current month
    // so the Leave Usage metric reflects actual planned leave days.
    const plannedLeaves = await Leave.find({
      employeeId,
      leaveType: 'planned',
      status: 'approved',
      startDate: { $lte: endDate },
      endDate: { $gte: startDate }
    }).select('startDate endDate numberOfDays');

    let plannedLeaveFromLeaves = 0;
    plannedLeaves.forEach(leave => {
      const leaveStart = moment.max(moment(leave.startDate).startOf('day'), moment(startDate).startOf('day'));
      const leaveEnd = moment.min(moment(leave.endDate).startOf('day'), moment(endDate).startOf('day'));
      const days = Math.max(0, leaveEnd.diff(leaveStart, 'days') + 1);
      plannedLeaveFromLeaves += days;
    });

    // Avoid double counting for planned leaves as well
    const plannedLeave = Math.max(plannedLeaveFromAttendance, plannedLeaveFromLeaves);

    const dashboardData = {
      present,
      weeklyOff,
      plannedLeave,
      unplannedLeave,
      attendance,
      month: moment(startDate).format('MMMM'),
      year: moment(startDate).format('YYYY')
    };

    res.json({ dashboardData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get admin dashboard
exports.getAdminDashboard = async (req, res) => {
  try {
    const { month, year } = req.query;

    let startDate = moment().startOf('month').toDate();
    let endDate = moment().endOf('month').toDate();

    if (month && year) {
      startDate = moment(`${year}-${month}`, 'YYYY-MM').startOf('month').toDate();
      endDate = moment(`${year}-${month}`, 'YYYY-MM').endOf('month').toDate();
    }

    // Total employees
    const totalEmployees = await Employee.countDocuments();
    
    // Gender count
    const maleCount = await Employee.countDocuments({ gender: 'Male' });
    const femaleCount = await Employee.countDocuments({ gender: 'Female' });

    // Employees by department
    const departmentData = await Department.aggregate([
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: 'department',
          as: 'employees'
        }
      },
      {
        $project: {
          name: 1,
          count: { $size: '$employees' }
        }
      }
    ]);

    // Attendance summary
    const attendance = await Attendance.find({
      date: { $gte: startDate, $lte: endDate }
    });

    const presentCount = attendance.filter(a => a.status === 'present').length;
    const absentCount = attendance.filter(a => a.status === 'absent').length;

    const dashboardData = {
      totalEmployees,
      maleCount,
      femaleCount,
      maleRatio: (maleCount / totalEmployees * 100).toFixed(2),
      femaleRatio: (femaleCount / totalEmployees * 100).toFixed(2),
      departmentData,
      presentCount,
      absentCount,
      attendanceRatio: (presentCount / (presentCount + absentCount) * 100).toFixed(2),
      month: moment(startDate).format('MMMM'),
      year: moment(startDate).format('YYYY')
    };

    res.json({ dashboardData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generate and send email report
exports.generateMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.body;

    const startDate = moment(`${year}-${month}`, 'YYYY-MM').startOf('month').toDate();
    const endDate = moment(`${year}-${month}`, 'YYYY-MM').endOf('month').toDate();

    const attendance = await Attendance.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate('employeeId', 'name email department');

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance Report');

    worksheet.columns = [
      { header: 'Employee ID', key: 'employeeId', width: 15 },
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Check In', key: 'checkInTime', width: 15 },
      { header: 'Check Out', key: 'checkOutTime', width: 15 }
    ];

    attendance.forEach(record => {
      worksheet.addRow({
        employeeId: record.employeeId.employeeId,
        name: record.employeeId.name,
        date: moment(record.date).format('YYYY-MM-DD'),
        status: record.status,
        checkInTime: record.checkInTime ? moment(record.checkInTime).format('HH:mm:ss') : '-',
        checkOutTime: record.checkOutTime ? moment(record.checkOutTime).format('HH:mm:ss') : '-'
      });
    });

    // Save and send email
    const fileName = `attendance_report_${month}_${year}.xlsx`;
    await workbook.xlsx.writeFile(fileName);

    res.json({
      message: 'Report generated successfully',
      fileName
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send attendance report immediately (Admin only)
exports.sendAttendanceReportNow = async (req, res) => {
  try {
    const { channel = 'all' } = req.body; // 'email', 'whatsapp', or 'all'

    // Verify admin role
    if (req.userRole !== 'admin' && req.userRole !== 'director') {
      return res.status(403).json({ error: 'Unauthorized - Admin access required' });
    }

    console.log(`Sending attendance report via ${channel}...`);
    await sendDailyAttendanceReport();

    res.json({
      success: true,
      message: `Attendance report sent successfully via ${channel}`,
      timestamp: new Date(),
      sentVia: ['email', 'whatsapp']
    });
  } catch (error) {
    console.error('Error sending report:', error);
    res.status(500).json({ error: error.message });
  }
};
