const Department = require('../models/Department');

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
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

module.exports = seedDatabase;
