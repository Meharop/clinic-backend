// Patient Routes - Manage patients
const express = require('express');
const router = express.Router();
const { checkAuth, checkRole } = require('../middleware/auth');
const Patient = require('../models/Patient');

// GET all patients (for receptionist, doctor, admin)
router.get('/', checkAuth, async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patients' });
  }
});

// GET patient's own details (for logged in patient)
router.get('/me', checkAuth, async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient record not found' });
    }
    
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patient details' });
  }
});

// GET patient by ID
router.get('/:id', checkAuth, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patient' });
  }
});

// ADD new patient (receptionist only)
router.post('/', checkAuth, checkRole('receptionist', 'admin'), async (req, res) => {
  try {
    const patient = new Patient(req.body);
    await patient.save();
    
    res.json({
      message: 'Patient added successfully',
      patient
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding patient', error: error.message });
  }
});

// UPDATE patient
router.put('/:id', checkAuth, checkRole('receptionist', 'admin'), async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json({
      message: 'Patient updated successfully',
      patient
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating patient' });
  }
});

// DELETE patient (admin only)
router.delete('/:id', checkAuth, checkRole('admin'), async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting patient' });
  }
});

module.exports = router;