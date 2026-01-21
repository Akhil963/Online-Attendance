const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// Get all departments (Public - for signup)
router.get('/', async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('managerId', 'name')
      .sort({ createdAt: -1 });

    res.json({ departments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get department with employee count
router.get('/with-count', authMiddleware, async (req, res) => {
  try {
    const departments = await Department.aggregate([
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
          _id: 1,
          name: 1,
          description: 1,
          managerId: 1,
          employeeCount: { $size: '$employees' }
        }
      },
      { $sort: { name: 1 } }
    ]);

    res.json({ departments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create department (Admin only)
router.post('/', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Department name is required' });
    }

    const department = new Department({ name, description });
    await department.save();

    res.status(201).json({
      message: 'Department created successfully',
      department
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update department (Admin only)
router.put('/:departmentId', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { name, description } = req.body;

    const department = await Department.findByIdAndUpdate(
      departmentId,
      {
        name: name || undefined,
        description: description || undefined,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json({
      message: 'Department updated successfully',
      department
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete department (Admin only)
router.delete('/:departmentId', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { departmentId } = req.params;

    const department = await Department.findByIdAndDelete(departmentId);

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
