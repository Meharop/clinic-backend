// Appointment Routes - Book and manage appointments
const express = require('express');
const router = express.Router();
const { checkAuth } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const User = require('../models/User');

// GET all appointments (filtered by role)
router.get('/', checkAuth, async (req, res) => {
  try {
    let appointments;
    
    // Patient sees only their appointments
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      appointments = await Appointment.find({ patientId: patient._id }).sort({ date: -1 });
    } 
    // Doctor sees their appointments
    else if (req.user.role === 'doctor') {
      appointments = await Appointment.find({ doctorId: req.user._id }).sort({ date: -1 });
    } 
    // Admin/Receptionist see all appointments
    else {
      appointments = await Appointment.find().sort({ date: -1 });
    }
    
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});

// GET today's appointments (for doctors)
router.get('/today', checkAuth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let query = {
      date: { $gte: today, $lt: tomorrow },
      status: 'scheduled'
    };
    
    // Doctor sees only their appointments
    if (req.user.role === 'doctor') {
      query.doctorId = req.user._id;
    }
    
    const appointments = await Appointment.find(query)
      .populate('patientId', 'name age contact')
      .sort({ time: 1 });
    
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching today\'s appointments' });
  }
});

// BOOK appointment
router.post('/', checkAuth, async (req, res) => {
  try {
    const { patientId, doctorId, date, time, reason } = req.body;
    
    // Get patient and doctor details
    let finalPatientId = patientId;
    let patientName = '';
    
    // If patient is booking, use their own ID
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      finalPatientId = patient._id;
      patientName = patient.name;
    } else {
      const patient = await Patient.findById(patientId);
      patientName = patient.name;
    }
    
    const doctor = await User.findById(doctorId);
    
    // Create appointment
    const appointment = new Appointment({
      patientId: finalPatientId,
      patientName,
      doctorId,
      doctorName: doctor.name,
      date,
      time,
      reason,
      status: 'scheduled'
    });
    
    await appointment.save();
    
    res.json({
      message: 'Appointment booked successfully',
      appointment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error booking appointment', error: error.message });
  }
});

// UPDATE appointment status
router.put('/:id', checkAuth, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json({
      message: 'Appointment updated successfully',
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating appointment' });
  }
});

// CANCEL appointment
router.patch('/:id/cancel', checkAuth, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json({
      message: 'Appointment cancelled successfully',
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling appointment' });
  }
});

// DELETE appointment
router.delete('/:id', checkAuth, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting appointment' });
  }
});

module.exports = router;