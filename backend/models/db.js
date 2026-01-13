const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  createdAt: { type: Date, default: Date.now }
});

const accommodationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  amenities: [String],
  availableFrom: { type: Date, required: true },
  availableTo: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const bookingSchema = new mongoose.Schema({
  accommodation: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Accommodation', 
    required: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Accommodation = mongoose.model('Accommodation', accommodationSchema);
const Booking = mongoose.model('Booking', bookingSchema);

module.exports = { User, Accommodation, Booking };
