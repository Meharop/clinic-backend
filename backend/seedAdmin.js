// Seed Admin Script
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./config/db');

const seedAdmin = async () => {
    try {
        await connectDB();

        const email = 'shahzaib4428@gmail.com';
        const password = '49882712'; // Specified password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            // Update existing user to be Admin with new password
            user.password = hashedPassword;
            user.role = 'admin';
            user.name = 'Shahzaib Admin';
            await user.save();
            console.log('✅ EXISTING User updated to Admin successfully!');
        } else {
            // Create new Admin user
            user = new User({
                name: 'Shahzaib Admin',
                email,
                password: hashedPassword,
                role: 'admin',
                phone: '0000000000',
                age: 25,
                gender: 'Male'
            });
            await user.save();
            console.log('✅ NEW Admin User created successfully!');
        }

        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${password}`);
        process.exit();

    } catch (error) {
        console.error('❌ Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
