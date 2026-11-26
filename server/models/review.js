import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
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
  clientName: {
    type: String,
    trim: true
  },
  service: {
    type: String,
    default: 'Aesthetics Treatment'
  },
  stars: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  quote: {
    type: String,
    default: ''
  },
  comment: {
    type: String,
    default: ''
  },
  avatarInitial: {
    type: String,
    default: 'N'
  },
  featured: {
    type: Boolean,
    default: false
  },
  approved: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
export default Review;
