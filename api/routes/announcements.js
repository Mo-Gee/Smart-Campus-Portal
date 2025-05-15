const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Initialize sample announcements
const initializeAnnouncements = async () => {
  try {
    const count = await Announcement.countDocuments();
    if (count === 0) {
      const sampleAnnouncements = [
        {
          title: 'Campus Maintenance Notice',
          content: 'The library will be closed for maintenance this weekend. Please plan accordingly.',
          category: 'maintenance',
          priority: 'high',
          attachments: []
        },
        {
          title: 'New Study Room Booking System',
          content: 'We have implemented a new online booking system for study rooms. Please check the portal for more details.',
          category: 'system',
          priority: 'medium',
          attachments: []
        },
        {
          title: 'Holiday Schedule',
          content: 'The campus will be closed during the upcoming holidays. Please check the schedule for specific dates.',
          category: 'general',
          priority: 'medium',
          attachments: []
        },
        {
          title: 'WiFi Upgrade',
          content: 'Campus WiFi will be upgraded to provide better connectivity. Brief interruptions may occur.',
          category: 'maintenance',
          priority: 'low',
          attachments: []
        },
        {
          title: 'Student Services Update',
          content: 'New services are now available at the student center. Visit us to learn more!',
          category: 'services',
          priority: 'medium',
          attachments: []
        }
      ];

      await Announcement.insertMany(sampleAnnouncements);
      console.log('Sample announcements initialized');
    }
  } catch (error) {
    console.error('Error initializing announcements:', error);
  }
};

// Initialize announcements when the server starts
initializeAnnouncements();

// Get all announcements
router.get('/', auth, async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 }); // Sort by newest first
    res.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ message: 'Error fetching announcements' });
  }
});

// Get announcement by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching announcement' });
  }
});

// Create new announcement (admin only)
router.post('/', [auth, admin], async (req, res) => {
  try {
    const announcement = new Announcement(req.body);
    await announcement.save();
    res.status(201).json(announcement);
  } catch (error) {
    res.status(400).json({ message: 'Error creating announcement' });
  }
});

// Update announcement (admin only)
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.json(announcement);
  } catch (error) {
    res.status(400).json({ message: 'Error updating announcement' });
  }
});

// Delete announcement (admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting announcement' });
  }
});

module.exports = router; 