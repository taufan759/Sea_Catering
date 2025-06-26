import User from '../models/UserModel.js';
import bcrypt from 'bcrypt';
import db from '../config/Database.js';
import dotenv from 'dotenv';

dotenv.config();

const seedUsers = async () => {
  try {
    // Connect to database
    await db.authenticate();
    console.log('✅ Database connected for SEA Catering user seeding');
    
    // Sync database
    await db.sync();
    console.log('✅ Database synced');
    
    // Check if users already exist
    const existingUsers = await User.count();
    
    if (existingUsers > 0) {
      console.log(`⚠️  Database already has ${existingUsers} users. Skipping seed...`);
      console.log('🗑️  If you want to re-seed, delete users first or use --force');
      process.exit(0);
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('password123', salt);
    const adminHashedPassword = await bcrypt.hash('admin123456', salt);
    
    console.log('🔐 Creating password hashes...');
    
    // Sample users data untuk SEA Catering
    const usersData = [
      {
        name: 'Super Admin',
        email: 'admin@seacatering.id',
        password: adminHashedPassword,
        role: 'super_admin'
      },
      {
        name: 'Admin User',
        email: 'admin.user@seacatering.id',
        password: adminHashedPassword,
        role: 'admin'
      },
      {
        name: 'Brian (Manager)',
        email: 'brian@seacatering.id',
        password: hashedPassword,
        role: 'admin'
      },
      {
        name: 'Taufan',
        email: 'taufan@example.com',
        password: hashedPassword,
        role: 'user'
      },
    ]; 
    // Create users
    const createdUsers = await User.bulkCreate(usersData);
    
    console.log('\n🎉 SEA Catering users seeded successfully!');
    console.log(`📊 Created ${createdUsers.length} users`);
    console.log('\n🔐 Admin Accounts:');
    console.log('📧 Super Admin: admin@seacatering.id | 🔑 Password: admin123456');
    console.log('📧 Admin: admin.user@seacatering.id | 🔑 Password: admin123456');
    console.log('📧 Brian (Manager): brian@seacatering.id | 🔑 Password: password123');
    console.log('\n👥 Customer Accounts:');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding SEA Catering users:', error);
    console.error('\n🔧 Possible solutions:');
    console.error('• Make sure MySQL is running');
    console.error('• Check database credentials in .env');
    console.error('• Ensure database "sea_catering" exists');
    process.exit(1);
  }
};

// Check for force flag
const forceReset = process.argv.includes('--force');
if (forceReset) {
  console.log('⚠️  Force flag detected - will delete existing users first');
}

// Run seeder
seedUsers();