const Employee = require('../models/Employee');
const Admin = require('../models/Admin');
const Department = require('../models/Department');
const { sendApprovalConfirmationToEmployee, sendRejectionEmailToEmployee } = require('../utils/emailService');

// Get employee profile
exports.getProfile = async (req, res) => {
  try {
    const employee = await Employee.findById(req.userId).populate('department');

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
    ).populate('department');

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

    res.json({
      message: 'Employee updated successfully',
      employee
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete employee (Admin)
exports.deleteEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await Employee.findByIdAndDelete(employeeId);

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
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
      employee
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
      employee
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
