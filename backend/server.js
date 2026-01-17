// Main Server File - This starts everything!
require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Create Express app
const app = express();

// Connect to MongoDB database
connectDB();

// Middleware - helps process requests
app.use(cors()); // Allows frontend to connect from different port
app.use(express.json()); // Allows reading JSON data from requests

// Import routes
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patient');
const appointmentRoutes = require('./routes/appointment');
const medicalRoutes = require('./routes/medical');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/user');

// Use routes
app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/patients', patientRoutes); // Patient management
app.use('/api/appointments', appointmentRoutes); // Appointment booking
app.use('/api/medical', medicalRoutes); // Medical records
app.use('/api/dashboard', dashboardRoutes); // Dashboard data
app.use('/api/users', userRoutes); // User management

// Test route - check if server is running
app.get('/', (req, res) => {
  res.json({ message: '✅ Clinic Management API is running!' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on ${PORT}`);
});