const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Initialize sample rooms
const initializeRooms = async () => {
  try {
    const count = await Room.countDocuments();
    if (count === 0) {
      const sampleRooms = [
        {
          name: 'Conference Room A',
          description: 'Large conference room with projector and whiteboard',
          capacity: 20,
          facilities: ['Projector', 'Whiteboard', 'Video Conferencing'],
          status: 'available'
        },
        {
          name: 'Study Room B',
          description: 'Quiet study room with individual workstations',
          capacity: 10,
          facilities: ['Computers', 'WiFi', 'Printing'],
          status: 'available'
        },
        {
          name: 'Meeting Room C',
          description: 'Small meeting room for team discussions',
          capacity: 8,
          facilities: ['TV Screen', 'Whiteboard'],
          status: 'available'
        }
      ];

      await Room.insertMany(sampleRooms);
      console.log('Sample rooms initialized');
    }
  } catch (error) {
    console.error('Error initializing rooms:', error);
  }
};

// Initialize rooms when the server starts
initializeRooms();

// Get all rooms
router.get('/', auth, async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Error fetching rooms' });
  }
});

// Get room by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching room' });
  }
});

// Create new room (admin only)
router.post('/', [auth, admin], async (req, res) => {
  try {
    const room = new Room(req.body);
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ message: 'Error creating room' });
  }
});

// Update room (admin only)
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(400).json({ message: 'Error updating room' });
  }
});

// Delete room (admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting room' });
  }
});

module.exports = router; 