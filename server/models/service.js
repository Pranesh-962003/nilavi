import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
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
  category: {
    type: String,
    default: 'general',
    trim: true
  },
  dur: {
    type: String,
    default: '45 mins'
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  active: {
    type: Boolean,
    default: true
  },
  svgSymbol: {
    type: String,
    default: 'sym-leaf'
  }
}, {
  timestamps: true
});

export const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema);
export default Service;
