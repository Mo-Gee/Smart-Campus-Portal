const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Get all bookings for a user
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('room')
      .sort({ startTime: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all bookings (admin only)
router.get('/', [auth, admin], async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('room')
      .sort({ startTime: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new booking
router.post('/', auth, async (req, res) => {
  const booking = new Booking({
    user: req.user._id,
    room: req.body.roomId,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    purpose: req.body.purpose,
    attendees: req.body.attendees
  });

  try {
    // Check if room is available for the requested time
    const conflictingBooking = await Booking.findOne({
      room: req.body.roomId,
      $or: [
        {
          startTime: { $lt: req.body.endTime },
          endTime: { $gt: req.body.startTime }
        }
      ]
    });

    if (conflictingBooking) {
      return res.status(400).json({ message: 'Room is already booked for this time slot' });
    }

    const newBooking = await booking.save();
    res.status(201).json(newBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update booking status (admin only)
router.patch('/:id/status', [auth, admin], async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = req.body.status;
    const updatedBooking = await booking.save();
    res.json(updatedBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Cancel booking
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Check if user is authorized to cancel this booking
    if (booking.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    booking.status = 'cancelled';
    await booking.save();
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 