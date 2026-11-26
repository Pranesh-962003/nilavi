import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerPhone: {
    type: String,
    required: true,
    trim: true
  },
  customerEmail: {
    type: String,
    default: '',
    trim: true
  },
  serviceId: {
    type: String,
    default: 'custom'
  },
  serviceName: {
    type: String,
    required: true
  },
  servicePrice: {
    type: Number,
    default: 0
  },
  serviceDuration: {
    type: String,
    default: ''
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true
  },
  timeSlot: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'confirmed'
  }
}, {
  timestamps: true
});

export const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
export default Booking;
