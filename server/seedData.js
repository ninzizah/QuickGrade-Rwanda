const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mcq_system');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing demo users
    await User.deleteMany({ 
      email: { 
        $in: ['student@demo.com', 'lecturer@demo.com', 'admin@demo.com'] 
      } 
    });

    // Create demo users
    const demoUsers = [
      {
        name: 'Demo Student',
        email: 'student@demo.com',
        password: 'password',
        role: 'student',
        studentId: 'STU001',
        department: 'Computer Science'
      },
      {
        name: 'Demo Lecturer',
        email: 'lecturer@demo.com',
        password: 'password',
        role: 'lecturer',
        department: 'Computer Science'
      },
      {
        name: 'Demo Admin',
        email: 'admin@demo.com',
        password: 'password',
        role: 'admin',
        department: 'Administration'
      }
    ];

    // Hash passwords and create users
    for (const userData of demoUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      await user.save();
      console.log(`✅ Created demo ${userData.role}: ${userData.email}`);
    }

    console.log('🎉 Demo accounts created successfully!');
    console.log('\n📝 Demo Login Credentials:');
    console.log('Student: student@demo.com / password');
    console.log('Lecturer: lecturer@demo.com / password');
    console.log('Admin: admin@demo.com / password');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding demo users:', error);
    process.exit(1);
  }
};

seedUsers();