const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user');
require('dotenv').config({ path: './.env' });

const seedSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const email = 'superadmin@vit.edu.in';
        const existingSuperAdmin = await User.findOne({ email });

        if (existingSuperAdmin) {
            console.log(`SuperAdmin already exists with email: ${email}`);
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('spotfix123', salt);

        const superAdminUser = new User({
            name: "Principal Setup",
            email: email,
            password: hashedPassword,
            role: "SuperAdmin",
            department: "All"
        });

        await superAdminUser.save();
        console.log(`\n✅ SuperAdmin account successfully created!`);
        console.log(`-------------------------------------------`);
        console.log(`Email:    ${email}`);
        console.log(`Password: spotfix123`);
        console.log(`-------------------------------------------\n`);

    } catch (err) {
        console.error("Failed to seed SuperAdmin:", err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

seedSuperAdmin();
