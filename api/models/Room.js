const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  facilities: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['available', 'booked', 'maintenance'],
    default: 'available'
  },
  location: {
    building: String,
    floor: String,
    roomNumber: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Room', roomSchema); 