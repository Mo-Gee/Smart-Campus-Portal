const express = require('express');
const router = express.Router();
const MaintenanceRequest = require('../models/MaintenanceRequest');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Get all maintenance requests for a user
router.get('/my-requests', auth, async (req, res) => {
  try {
    const requests = await MaintenanceRequest.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all maintenance requests (admin only)
router.get('/', [auth, admin], async (req, res) => {
  try {
    const requests = await MaintenanceRequest.find()
      .populate('user', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ priority: 1, createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new maintenance request
router.post('/', auth, async (req, res) => {
  const request = new MaintenanceRequest({
    user: req.user._id,
    title: req.body.title,
    description: req.body.description,
    location: req.body.location,
    priority: req.body.priority,
    images: req.body.images
  });

  try {
    const newRequest = await request.save();
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update maintenance request status (admin only)
router.patch('/:id/status', [auth, admin], async (req, res) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = req.body.status;
    if (req.body.assignedTo) {
      request.assignedTo = req.body.assignedTo;
    }
    
    const updatedRequest = await request.save();
    res.json(updatedRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update maintenance request (user can only update their own requests)
router.patch('/:id', auth, async (req, res) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Check if user is authorized to update this request
    if (request.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this request' });
    }

    // Only allow updating certain fields
    const allowedUpdates = ['title', 'description', 'priority', 'images'];
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        request[key] = req.body[key];
      }
    });

    const updatedRequest = await request.save();
    res.json(updatedRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete maintenance request
router.delete('/:id', auth, async (req, res) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Check if user is authorized to delete this request
    if (request.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this request' });
    }

    await request.remove();
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 