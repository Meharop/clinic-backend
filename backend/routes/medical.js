// Medical Record Routes - Doctor's notes and prescriptions
const express = require('express');
const router = express.Router();
const { checkAuth, checkRole } = require('../middleware/auth');
const MedicalRecord = require('../models/MedicalRecord');
const Patient = require('../models/Patient');

// GET all medical records (filtered by role)
router.get('/', checkAuth, async (req, res) => {
  try {
    let records;
    
    // Patient sees only their records
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      records = await MedicalRecord.find({ patientId: patient._id }).sort({ createdAt: -1 });
    } 
    // Doctor sees records they created
    else if (req.user.role === 'doctor') {
      records = await MedicalRecord.find({ doctorId: req.user._id }).sort({ createdAt: -1 });
    } 
    // Admin/Receptionist see all
    else {
      records = await MedicalRecord.find().sort({ createdAt: -1 });
    }
    
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching medical records' });
  }
});

// GET medical records for specific patient
router.get('/patient/:patientId', checkAuth, async (req, res) => {
  try {
    const records = await MedicalRecord.find({ 
      patientId: req.params.patientId 
    }).sort({ createdAt: -1 });
    
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patient records' });
  }
});

// ADD medical record (Doctor only)
router.post('/', checkAuth, checkRole('doctor'), async (req, res) => {
  try {
    const { patientId, diagnosis, prescription, notes } = req.body;
    
    // Get patient name
    const patient = await Patient.findById(patientId);
    
    // Create medical record
    const record = new MedicalRecord({
      patientId,
      patientName: patient.name,
      doctorId: req.user._id,
      doctorName: req.user.name,
      diagnosis,
      prescription,
      notes
    });
    
    await record.save();
    
    res.json({
      message: 'Medical record added successfully',
      record
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding medical record', error: error.message });
  }
});

// UPDATE medical record (Doctor who created it)
router.put('/:id', checkAuth, checkRole('doctor'), async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    
    if (!record) {
      return res.status(404).json({ message: 'Medical record not found' });
    }
    
    // Check if this doctor created the record
    if (record.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only update your own records' });
    }
    
    // Update record
    const updatedRecord = await MedicalRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    res.json({
      message: 'Medical record updated successfully',
      record: updatedRecord
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating medical record' });
  }
});

// DELETE medical record (Admin only)
router.delete('/:id', checkAuth, checkRole('admin'), async (req, res) => {
  try {
    const record = await MedicalRecord.findByIdAndDelete(req.params.id);
    
    if (!record) {
      return res.status(404).json({ message: 'Medical record not found' });
    }
    
    res.json({ message: 'Medical record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting medical record' });
  }
});

module.exports = router;