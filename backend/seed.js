#!/usr/bin/env node
/**
 * Standalone Seed Script
 * Run with: node seed.js
 * This seeds default departments and sample data to MongoDB
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Department = require('./models/Department');
const Employee = require('./models/Employee');
const seedDatabase = require('./utils/seedDatabase');

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

async function runSeed() {
  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_system', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check if departments exist
    const existingDepartments = await Department.countDocuments();
    
    if (existingDepartments === 0) {
      console.log('\n🌱 Seeding default departments...');
      const result = await Department.insertMany(defaultDepartments);
      console.log(`✅ ${result.length} departments created:`);
      result.forEach(dept => {
        console.log(`   ✓ ${dept.name}`);
      });
    } else {
      console.log(`\n✅ Department collection already has ${existingDepartments} departments`);
      console.log('\n📋 Existing departments:');
      const depts = await Department.find().select('name description');
      depts.forEach(dept => {
        console.log(`   ✓ ${dept.name} - ${dept.description}`);
      });
    }

    // Run full seed (employees and attendance)
    console.log('\n📊 Running full database seed...');
    await seedDatabase();

    console.log('\n✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the seed
runSeed();
