const Department = require('../models/Department');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const moment = require('moment');

const defaultDepartments = [
  {
    name: 'IT',
    description: 'Information Technology Department'
  },
  {
    name: 'HR',
    description: 'Human Resources Department'
  },
  {
    name: 'Web Developer',
    description: 'Web Development Department'
  },
  {
    name: 'Finance',
    description: 'Finance Department'
  },
  {
    name: 'Sales',
    description: 'Sales Department'
  },
  {
    name: 'Marketing',
    description: 'Marketing Department'
  },
  {
    name: 'Operations',
    description: 'Operations Department'
  }
];

const seedDatabase = async () => {
  try {
    // Check if departments already exist
    const existingDepartments = await Department.countDocuments();
    
    if (existingDepartments === 0) {
      console.log('🌱 Seeding default departments...');
      await Department.insertMany(defaultDepartments);
      console.log('✅ Default departments created successfully!');
      console.log('   - IT');
      console.log('   - HR');
      console.log('   - Web Developer');
      console.log('   - Finance');
      console.log('   - Sales');
      console.log('   - Marketing');
      console.log('   - Operations');
    } else {
      console.log(`✓ Database already has ${existingDepartments} departments`);
    }

    // Seed sample employees with pre-approved status
    await seedSampleEmployees();

    // Seed sample attendance data for approved employees
    await seedAttendanceData();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

const seedSampleEmployees = async () => {
  try {
    const existingEmployees = await Employee.countDocuments();
    if (existingEmployees > 0) {
      console.log(`✓ Employees already exist (${existingEmployees} employees)`);
      return;
    }

    console.log('🌱 Seeding sample employees...');

    // Get IT department for sample employees
    const itDept = await Department.findOne({ name: 'IT' });
    const hrDept = await Department.findOne({ name: 'HR' });

    const sampleEmployees = [
      {
        name: 'John Developer',
        email: 'john@attendance.test',
        password: 'Test@1234', // Will be hashed by pre-save hook
        employeeId: 'EMP001',
        department: itDept._id,
        isApproved: true,
        approvalDate: new Date(),
        phone: '9876543210',
        gender: 'Male',
        address: 'New Delhi, India'
      },
      {
        name: 'Sarah Manager',
        email: 'sarah@attendance.test',
        password: 'Test@1234',
        employeeId: 'EMP002',
        department: hrDept._id,
        isApproved: true,
        approvalDate: new Date(),
        phone: '9876543211',
        gender: 'Female',
        address: 'Mumbai, India'
      },
      {
        name: 'Raj Designer',
        email: 'raj@attendance.test',
        password: 'Test@1234',
        employeeId: 'EMP003',
        department: itDept._id,
        isApproved: true,
        approvalDate: new Date(),
        phone: '9876543212',
        gender: 'Male',
        address: 'Bangalore, India'
      }
    ];

    await Employee.insertMany(sampleEmployees);
    console.log(`✅ Seeded ${sampleEmployees.length} sample employees`);
    console.log('\n📝 Test Employee Credentials:');
    sampleEmployees.forEach((emp, idx) => {
      console.log(`   ${idx + 1}. Email: ${emp.email}, Password: ${emp.password}`);
    });
  } catch (error) {
    console.error('❌ Error seeding employees:', error);
  }
};

const seedAttendanceData = async () => {
  try {
    const existingCount = await Attendance.countDocuments();
    if (existingCount > 0) {
      console.log(`✓ Attendance records already exist (${existingCount} records)`);
      return;
    }

    console.log('🌱 Seeding sample attendance data...');

    // Get all approved employees
    const employees = await Employee.find({ isApproved: true });
    
    if (employees.length === 0) {
      console.log('ℹ️  No approved employees found. Skipping attendance seeding.');
      return;
    }

    const attendanceRecords = [];
    const currentDate = moment();
    const startOfMonth = moment().startOf('month');
    const endOfMonth = moment().endOf('month');

    // Create attendance records for the current month
    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];
      let date = startOfMonth.clone();

      while (date.isBefore(endOfMonth) || date.isSame(endOfMonth, 'day')) {
        const dayOfWeek = date.day();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6

        // Randomly assign status for weekdays
        if (isWeekend) {
          // Weekend = weekly off
          attendanceRecords.push({
            employeeId: employee._id,
            date: date.toDate(),
            status: 'weekly_off'
          });
        } else {
          // Weekday: randomly assign present, planned_leave, or unplanned_leave
          const random = Math.random();
          let status;
          if (random < 0.7) {
            status = 'present';
          } else if (random < 0.9) {
            status = 'planned_leave';
          } else {
            status = 'unplanned_leave';
          }

          attendanceRecords.push({
            employeeId: employee._id,
            date: date.toDate(),
            status: status,
            checkInTime: status === 'present' ? new Date(date.format('YYYY-MM-DD') + ' 09:30:00') : undefined,
            checkOutTime: status === 'present' ? new Date(date.format('YYYY-MM-DD') + ' 18:00:00') : undefined,
            workingHours: status === 'present' ? 8.5 : 0
          });
        }

        date.add(1, 'day');
      }
    }

    if (attendanceRecords.length > 0) {
      await Attendance.insertMany(attendanceRecords);
      console.log(`✅ Seeded ${attendanceRecords.length} attendance records for ${employees.length} employees`);
      console.log(`   📅 Month: ${moment().format('MMMM YYYY')}`);
      console.log(`   👥 Employees: ${employees.length}`);
      
      // Log sample record details
      if (employees.length > 0) {
        const sampleEmployee = employees[0];
        const sampleRecords = attendanceRecords.filter(r => r.employeeId.toString() === sampleEmployee._id.toString()).slice(0, 5);
        console.log(`\n📋 Sample records for ${sampleEmployee.name} (ID: ${sampleEmployee._id}):`);
        sampleRecords.forEach(r => {
          console.log(`   - ${moment(r.date).format('DD-MM-YYYY ddd')}: ${r.status}`);
        });
      }
    }
  } catch (error) {
    console.error('❌ Error seeding attendance data:', error);
  }
};

module.exports = seedDatabase;
