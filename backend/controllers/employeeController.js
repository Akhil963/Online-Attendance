const Employee = require('../models/Employee');
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

    res.json({
      message: 'Profile updated successfully',
      employee
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Delete old profile picture if it exists
    const employee = await Employee.findById(req.userId);
    if (employee && employee.profilePicture && employee.profilePicture.startsWith('/uploads/')) {
      const oldImagePath = require('path').join(__dirname, '..', employee.profilePicture);
      if (require('fs').existsSync(oldImagePath)) {
        require('fs').unlinkSync(oldImagePath);
      }
    }

    // Store relative path to the uploaded file
    const profilePictureUrl = `/uploads/profile-pictures/${req.file.filename}`;

    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.userId,
      { profilePicture: profilePictureUrl, updatedAt: new Date() },
      { new: true }
    ).populate('department');

    res.json({
      message: 'Profile picture updated successfully',
      employee: updatedEmployee,
      imageUrl: profilePictureUrl
    });
  } catch (error) {
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

    res.json({
      message: 'Employee account approval revoked',
      employee
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
