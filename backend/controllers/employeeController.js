const Employee = require('../models/Employee');
const Admin = require('../models/Admin');
const Department = require('../models/Department');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const PasswordReset = require('../models/PasswordReset');
const { sendApprovalConfirmationToEmployee, sendRejectionEmailToEmployee } = require('../utils/emailService');

// Get employee profile
exports.getProfile = async (req, res) => {
  try {
    const employee = await Employee.findById(req.userId).populate('department').select('-password');

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ employee });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update employee profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, designation, gender, address } = req.body;
    const employeeId = req.userId;

    const employee = await Employee.findByIdAndUpdate(
      employeeId,
      {
        name: name || undefined,
        phone: phone || undefined,
        designation: designation || undefined,
        gender: gender || undefined,
        address: address || undefined,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('department').select('-password');

    // Emit realtime update for profile changes
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${employeeId}`).emit('profile:updated', {
        employee: employee
      });
    }

    res.json({
      message: 'Profile updated successfully',
      employee
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Upload profile picture (for both admin and employee)
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Determine if user is admin or employee
    const isAdmin = req.userRole === 'admin';
    const Model = isAdmin ? Admin : Employee;

    // Delete old profile picture if it exists
    const user = await Model.findById(req.userId);
    if (user && user.profilePicture && user.profilePicture.startsWith('/uploads/')) {
      const oldImagePath = require('path').join(__dirname, '..', user.profilePicture);
      if (require('fs').existsSync(oldImagePath)) {
        require('fs').unlinkSync(oldImagePath);
      }
    }

    // Store relative path to the uploaded file
    const profilePictureUrl = `/uploads/profile-pictures/${req.file.filename}`;

    let updatedUser;
    if (isAdmin) {
      updatedUser = await Admin.findByIdAndUpdate(
        req.userId,
        { profilePicture: profilePictureUrl, updatedAt: new Date() },
        { new: true }
      ).select('-password');
    } else {
      updatedUser = await Employee.findByIdAndUpdate(
        req.userId,
        { profilePicture: profilePictureUrl, updatedAt: new Date() },
        { new: true }
      ).populate('department');
      // Ensure password is not included
      if (updatedUser && updatedUser.password) {
        updatedUser = await Employee.findById(req.userId).populate('department').select('-password');
      }
    }

    // Emit realtime update for profile picture changes
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${req.userId}`).emit('profile:updated', {
        employee: updatedUser,
        imageUrl: profilePictureUrl
      });
    }

    const responseKey = isAdmin ? 'admin' : 'employee';
    res.json({
      message: 'Profile picture updated successfully',
      [responseKey]: updatedUser,
      user: updatedUser,
      imageUrl: profilePictureUrl
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all employees (Admin)
exports.getAllEmployees = async (req, res) => {
  try {
    const { departmentId, status } = req.query;

    let query = {};
    if (departmentId) {
      query.department = departmentId;
    }
    if (status) {
      query.status = status;
    }

    const employees = await Employee.find(query)
      .populate('department')
      .select('-password');

    res.json({ employees });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Restrict access: non-admins can only fetch their own profile
    if (req.userRole !== 'admin' && req.userId !== employeeId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const employee = await Employee.findById(employeeId)
      .populate('department')
      .select('-password');

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ employee });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update employee (Admin)
exports.updateEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { name, phone, designation, gender, address, status, role, department } = req.body;

    const employee = await Employee.findByIdAndUpdate(
      employeeId,
      {
        name: name || undefined,
        phone: phone || undefined,
        designation: designation || undefined,
        gender: gender || undefined,
        address: address || undefined,
        status: status || undefined,
        role: role || undefined,
        department: department || undefined,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('department');

    // Ensure password is not returned
    const safeEmployee = await Employee.findById(employee._id).populate('department').select('-password');

    res.json({
      message: 'Employee updated successfully',
      employee: safeEmployee
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete employee (Admin)
exports.deleteEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await Employee.findById(employeeId).select('_id');

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    await Promise.all([
      Attendance.deleteMany({ employeeId: employee._id }),
      Leave.deleteMany({ employeeId: employee._id }),
      PasswordReset.deleteMany({ userId: employee._id, userType: 'employee' }),
      Employee.updateMany({ approvedBy: employee._id }, { $set: { approvedBy: null, approvalDate: null, isApproved: false } }),
      Department.updateMany({ managerId: employee._id }, { $set: { managerId: null } })
    ]);

    await Employee.findByIdAndDelete(employeeId);

    const io = req.app.get('io');
    if (io) {
      io.to(`user-${employeeId}`).emit('auth:sessionInvalidated', {
        reason: 'account_deleted',
        message: 'Your account has been deleted by admin. Please contact support.'
      });
      io.to('admin').emit('employee:statusUpdated', {
        type: 'deletion',
        employeeId,
        timestamp: new Date()
      });
    }

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve employee account (Admin)
exports.approveEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const adminId = req.userId;
    const io = req.app.get('io'); // Get Socket.io instance

    const employee = await Employee.findByIdAndUpdate(
      employeeId,
      {
        isApproved: true,
        approvalDate: new Date(),
        approvedBy: adminId,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('department').populate('approvedBy', 'name email adminId');

    // Remove password from returned employee
    const safeEmployee = await Employee.findById(employee._id).populate('department').populate('approvedBy', 'name email adminId').select('-password');

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Send approval confirmation email to employee
    try {
      const approverAdmin = await require('mongoose').model('Admin').findById(adminId);
      await sendApprovalConfirmationToEmployee(employee, approverAdmin || { name: 'Administrator' });
    } catch (emailError) {
      console.error('Failed to send approval confirmation email:', emailError);
      // Don't fail the approval if email fails
    }

    // Emit real-time socket event for approval
    if (io) {
      // Notify the specific employee
      io.to(`user-${employeeId}`).emit('employee:approved', {
        employeeId: employee._id,
        email: employee.email,
        name: employee.name,
        message: 'Your account has been approved! Please login to continue.'
      });

      // Broadcast to admin dashboard
      io.to('admin').emit('employee:statusUpdated', {
        type: 'approval',
        employeeId: employee._id,
        email: employee.email,
        name: employee.name,
        timestamp: new Date()
      });
    }

    res.json({
      message: 'Employee account approved successfully',
      employee: safeEmployee
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reject/Revoke employee account approval (Admin)
exports.rejectEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { reason } = req.body;
    const io = req.app.get('io'); // Get Socket.io instance

    const employee = await Employee.findByIdAndUpdate(
      employeeId,
      {
        isApproved: false,
        approvalDate: null,
        approvedBy: null,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('department');

    // Remove password from returned employee
    const safeEmployee = await Employee.findById(employee._id).populate('department').select('-password');

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Send rejection email to employee
    try {
      await sendRejectionEmailToEmployee(employee, reason || null);
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
      // Don't fail the rejection if email fails
    }

    // Emit real-time socket event for rejection
    if (io) {
      // Notify the specific employee
      io.to(`user-${employeeId}`).emit('employee:rejected', {
        employeeId: employee._id,
        email: employee.email,
        name: employee.name,
        reason: reason || 'Your account approval has been rejected.',
        message: 'Your account approval has been rejected.'
      });

      // Broadcast to admin dashboard
      io.to('admin').emit('employee:statusUpdated', {
        type: 'rejection',
        employeeId: employee._id,
        email: employee.email,
        name: employee.name,
        timestamp: new Date()
      });
    }

    res.json({
      message: 'Employee account approval revoked',
      employee: safeEmployee
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Download daily attendance report as Excel
exports.downloadDailyReport = async (req, res) => {
  try {
    const moment = require('moment');
    const ExcelJS = require('exceljs');

    const dateParam = req.query.date; // YYYY-MM-DD
    const targetDate = dateParam ? moment(dateParam, 'YYYY-MM-DD') : moment();
    const start = targetDate.startOf('day').toDate();
    const end = targetDate.endOf('day').toDate();

    const attendance = await require('../models/Attendance').find({ date: { $gte: start, $lte: end } })
      .populate('employeeId', 'employeeId name email department phone');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Daily Attendance');

    worksheet.columns = [
      { header: 'Date', key: 'date', width: 14 },
      { header: 'Employee ID', key: 'employeeId', width: 18 },
      { header: 'Name', key: 'name', width: 24 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Check In', key: 'checkIn', width: 14 },
      { header: 'Check Out', key: 'checkOut', width: 14 },
      { header: 'Working Hours', key: 'workingHours', width: 14 }
    ];

    worksheet.getRow(1).font = { bold: true };

    attendance.forEach(rec => {
      const emp = rec.employeeId || {};
      worksheet.addRow({
        date: moment(rec.date).format('YYYY-MM-DD'),
        employeeId: emp.employeeId || emp._id || '-',
        name: emp.name || '-',
        email: emp.email || '-',
        department: emp.department?.name || '-',
        status: rec.status || '-',
        checkIn: rec.checkInTime ? moment(rec.checkInTime).format('hh:mm:ss A') : '-',
        checkOut: rec.checkOutTime ? moment(rec.checkOutTime).format('hh:mm:ss A') : '-',
        workingHours: typeof rec.workingHours === 'number' ? rec.workingHours : (rec.workingHours || '-')
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const label = targetDate.format('YYYY-MM-DD');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="attendance_daily_${label}.xlsx"`);
    return res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('downloadDailyReport error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Download monthly attendance report as Excel
exports.downloadMonthlyReport = async (req, res) => {
  try {
    const moment = require('moment');
    const ExcelJS = require('exceljs');

    const monthParam = req.query.month; // YYYY-MM
    const target = monthParam ? moment(monthParam, 'YYYY-MM') : moment();
    const start = target.startOf('month').toDate();
    const end = target.endOf('month').toDate();

    const attendance = await require('../models/Attendance').find({ date: { $gte: start, $lte: end } })
      .populate('employeeId', 'employeeId name email department phone');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Monthly Attendance');

    worksheet.columns = [
      { header: 'Date', key: 'date', width: 14 },
      { header: 'Employee ID', key: 'employeeId', width: 18 },
      { header: 'Name', key: 'name', width: 24 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Check In', key: 'checkIn', width: 14 },
      { header: 'Check Out', key: 'checkOut', width: 14 },
      { header: 'Working Hours', key: 'workingHours', width: 14 }
    ];

    worksheet.getRow(1).font = { bold: true };

    attendance.forEach(rec => {
      const emp = rec.employeeId || {};
      worksheet.addRow({
        date: moment(rec.date).format('YYYY-MM-DD'),
        employeeId: emp.employeeId || emp._id || '-',
        name: emp.name || '-',
        email: emp.email || '-',
        department: emp.department?.name || '-',
        status: rec.status || '-',
        checkIn: rec.checkInTime ? moment(rec.checkInTime).format('hh:mm:ss A') : '-',
        checkOut: rec.checkOutTime ? moment(rec.checkOutTime).format('hh:mm:ss A') : '-',
        workingHours: typeof rec.workingHours === 'number' ? rec.workingHours : (rec.workingHours || '-')
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const label = target.format('MMMM_YYYY');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="attendance_monthly_${label}.xlsx"`);
    return res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('downloadMonthlyReport error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Validate database employee and attendance data
exports.validateDatabase = async (req, res) => {
  try {
    const EmployeeModel = require('../models/Employee');
    const AttendanceModel = require('../models/Attendance');

    const employees = await EmployeeModel.find({}).populate('department');
    const attendances = await AttendanceModel.find({}).populate('employeeId');

    const issues = { employees: [], attendance: [], summary: {} };

    // Employee checks
    const seenEmployeeIds = {};
    employees.forEach(emp => {
      const problems = [];
      if (!emp.employeeId) problems.push('missing_employeeId');
      if (!emp.name) problems.push('missing_name');
      if (!emp.email) problems.push('missing_email');
      if (!emp.department) problems.push('missing_department');
      // basic email validation
      if (emp.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emp.email)) problems.push('invalid_email');
      if (emp.employeeId) {
        if (seenEmployeeIds[emp.employeeId]) {
          problems.push('duplicate_employeeId');
          issues.employees.find(e => e._id === seenEmployeeIds[emp.employeeId])?.problems.push('duplicate_employeeId');
        } else {
          seenEmployeeIds[emp.employeeId] = emp._id.toString();
        }
      }
      if (problems.length > 0) {
        issues.employees.push({ _id: emp._id, employeeId: emp.employeeId || null, name: emp.name || null, problems });
      }
    });

    // Attendance checks
    attendances.forEach(a => {
      const problems = [];
      if (!a.employeeId) problems.push('missing_employee_reference');
      else if (!a.employeeId._id) problems.push('employee_not_found');
      if (!a.status) problems.push('missing_status');
      if (problems.length > 0) {
        issues.attendance.push({ _id: a._id, date: a.date, employeeId: a.employeeId?._id || null, problems });
      }
    });

    issues.summary.totalEmployees = employees.length;
    issues.summary.employeesWithProblems = issues.employees.length;
    issues.summary.totalAttendanceRecords = attendances.length;
    issues.summary.attendanceWithProblems = issues.attendance.length;

    res.json({ issues });
  } catch (error) {
    console.error('validateDatabase error:', error);
    res.status(500).json({ error: error.message });
  }
};
