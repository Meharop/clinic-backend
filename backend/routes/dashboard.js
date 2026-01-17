// Dashboard Routes - Get statistics and data
const express = require('express');
const router = express.Router();
const { checkAuth, checkRole } = require('../middleware/auth');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const MedicalRecord = require('../models/MedicalRecord');

// GET dashboard statistics
router.get('/stats', checkAuth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let stats = {};
    
    // Different stats for different roles
    if (req.user.role === 'admin' || req.user.role === 'receptionist') {
      // Admin/Receptionist see everything
      const totalPatients = await Patient.countDocuments();
      const todayAppointments = await Appointment.countDocuments({
        date: { $gte: today, $lt: tomorrow },
        status: 'scheduled'
      });
      const totalAppointments = await Appointment.countDocuments();
      const totalDoctors = await User.countDocuments({ role: 'doctor' });
      
      stats = {
        totalPatients,
        todayAppointments,
        totalAppointments,
        totalDoctors
      };
      
    } else if (req.user.role === 'doctor') {
      // Doctor sees their stats
      const todayAppointments = await Appointment.countDocuments({
        doctorId: req.user._id,
        date: { $gte: today, $lt: tomorrow },
        status: 'scheduled'
      });
      
      const totalPatients = await Appointment.distinct('patientId', { 
        doctorId: req.user._id 
      });
      
      const completedAppointments = await Appointment.countDocuments({
        doctorId: req.user._id,
        status: 'completed'
      });
      
      const medicalRecords = await MedicalRecord.countDocuments({
        doctorId: req.user._id
      });
      
      stats = {
        todayAppointments,
        totalPatients: totalPatients.length,
        completedAppointments,
        medicalRecords
      };
      
    } else if (req.user.role === 'patient') {
      // Patient sees their stats
      const patient = await Patient.findOne({ userId: req.user._id });
      
      const totalAppointments = await Appointment.countDocuments({
        patientId: patient._id
      });
      
      const upcomingAppointments = await Appointment.countDocuments({
        patientId: patient._id,
        date: { $gte: today },
        status: 'scheduled'
      });
      
      const medicalRecords = await MedicalRecord.countDocuments({
        patientId: patient._id
      });
      
      stats = {
        totalAppointments,
        upcomingAppointments,
        medicalRecords
      };
    }
    
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

// GET list of all doctors (for appointment booking)
router.get('/doctors', checkAuth, async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('name email phone');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctors' });
  }
});

// GET all users (Admin only)
router.get('/users', checkAuth, checkRole('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

module.exports = router;