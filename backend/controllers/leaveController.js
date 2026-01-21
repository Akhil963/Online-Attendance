const Leave = require('../models/Leave');
const Employee = require('../models/Employee');

// Apply for leave
exports.applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const employeeId = req.userId;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Calculate number of days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const numberOfDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const leave = new Leave({
      employeeId,
      leaveType,
      startDate,
      endDate,
      reason,
      numberOfDays
    });

    await leave.save();

    res.status(201).json({
      message: 'Leave application submitted',
      leave
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get employee's leave applications
exports.getMyLeaves = async (req, res) => {
  try {
    const employeeId = req.userId;

    const leaves = await Leave.find({ employeeId })
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ leaves });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all leave applications (Admin/Manager)
exports.getAllLeaves = async (req, res) => {
  try {
    const { status, departmentId } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (departmentId) {
      const employees = await Employee.find({ department: departmentId });
      const employeeIds = employees.map(e => e._id);
      query.employeeId = { $in: employeeIds };
    }

    const leaves = await Leave.find(query)
      .populate('employeeId', 'name employeeId email')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ leaves });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve leave
exports.approveLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const approverId = req.userId;

    const leave = await Leave.findByIdAndUpdate(
      leaveId,
      {
        status: 'approved',
        approvedBy: approverId,
        approvalDate: new Date()
      },
      { new: true }
    );

    if (!leave) {
      return res.status(404).json({ error: 'Leave not found' });
    }

    res.json({
      message: 'Leave approved',
      leave
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reject leave
exports.rejectLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { rejectionReason } = req.body;
    const approverId = req.userId;

    const leave = await Leave.findByIdAndUpdate(
      leaveId,
      {
        status: 'rejected',
        approvedBy: approverId,
        approvalDate: new Date(),
        rejectionReason
      },
      { new: true }
    );

    if (!leave) {
      return res.status(404).json({ error: 'Leave not found' });
    }

    res.json({
      message: 'Leave rejected',
      leave
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create unplanned leave for employee (Admin only)
exports.createUnplannedLeave = async (req, res) => {
  try {
    const { employeeId, startDate, endDate, reason, leaveType } = req.body;
    const adminId = req.userId;

    if (!employeeId || !startDate || !endDate || !reason) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Calculate number of days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const numberOfDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const leave = new Leave({
      employeeId,
      leaveType: leaveType || 'unplanned',
      startDate,
      endDate,
      reason,
      status: 'approved', // Admin created leaves are auto-approved
      approvedBy: adminId,
      approvalDate: new Date(),
      numberOfDays
    });

    await leave.save();

    res.status(201).json({
      message: 'Unplanned leave created and approved',
      leave
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get unplanned leaves (Admin)
exports.getUnplannedLeaves = async (req, res) => {
  try {
    const { employeeId, status } = req.query;
    let query = { leaveType: 'unplanned' };

    if (employeeId) {
      query.employeeId = employeeId;
    }

    if (status) {
      query.status = status;
    }

    const leaves = await Leave.find(query)
      .populate('employeeId', 'name employeeId email department')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ leaves });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
