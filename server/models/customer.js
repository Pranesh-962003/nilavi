import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    default: 'Unnamed client',
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    default: '',
    trim: true
  },
  tags: {
    type: [String],
    default: ['New Client']
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);
export default Customer;
