// test-password.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const testPasswordHashing = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        // Import User model
        const User = (await import('./Models/User.js')).default;
        
        // Test user data
        const testEmail = 'test@remedy.com';
        const testPassword = 'password123';
        
        // Check if test user exists
        let user = await User.findOne({ email: testEmail });
        
        if (!user) {
            console.log('👤 Creating test user...');
            user = new User({
                name: 'Test User',
                email: testEmail,
                password: testPassword,
                role: 'Employee'
            });
            await user.save();
            console.log('✅ Test user created');
        }
        
        console.log('\n🔍 TESTING PASSWORD HASHING:');
        console.log('Original password:', testPassword);
        console.log('Stored password hash:', user.password);
        
        // Test password comparison
        const isMatch = await bcrypt.compare(testPassword, user.password);
        console.log('Password comparison result:', isMatch);
        
        if (isMatch) {
            console.log('✅ Password hashing is working correctly!');
        } else {
            console.log('❌ Password hashing is NOT working!');
        }
        
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

testPasswordHashing();