const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config({ path: `${__dirname}/config.env` });

// Load MongoDB connection
mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 60000,
    socketTimeoutMS: 60000,
  })
  .then(() => {
    console.log('DB connection successfully established!');
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  });

// Import the User model
const User = require('./models/userModel');

async function createAdminUser() {
  try {
    // Admin credentials
    const email = 'admin@rcsandwitch.com';
    const password = 'admin123'; // This should be changed after first login
    const name = 'Admin User';

    // Check if admin already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const user = await User.create({
      email,
      name,
      password, // Password will be hashed by the model's pre-save middleware
      isAdmin: true,
    });

    console.log('Admin user created successfully:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('Please change this password after the first login!');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    // Close the database connection
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
}

createAdminUser();
