import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    default: '',
    trim: true
  },
  email: {
    type: String,
    default: '',
    trim: true
  },
  topic: {
    type: String,
    default: 'General Inquiry'
  },
  service: {
    type: String,
    default: 'General Service'
  },
  message: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: 'new'
  },
  source: {
    type: String,
    default: 'website'
  },
  notes: {
    type: String,
    default: ''
  },
  history: [
    {
      id: String,
      action: String,
      note: String,
      timestamp: String,
      author: String
    }
  ]
}, {
  timestamps: true
});

export const Inquiry = mongoose.models.Inquiry || mongoose.model('Inquiry', inquirySchema);
export default Inquiry;
