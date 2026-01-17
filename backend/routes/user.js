// User Routes - Manage Users (Admin Only)
const express = require('express');
const router = express.Router();
const { checkAuth, checkRole } = require('../middleware/auth');
const User = require('../models/User');

// UPDATE user
router.put('/:id', checkAuth, checkRole('admin'), async (req, res) => {
    try {
        const { name, email, role, phone } = req.body;

        // Only allow updating specific fields
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, role, phone },
            { new: true }
        ).select('-password'); // Don't return password

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'User updated successfully',
            user
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user' });
    }
});

// DELETE user
router.delete('/:id', checkAuth, checkRole('admin'), async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
});

module.exports = router;
