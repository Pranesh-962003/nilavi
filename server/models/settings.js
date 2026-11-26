import mongoose from 'mongoose';

const galleryImageSchema = new mongoose.Schema({
  id: { type: Number },
  cat: { type: String, default: 'general' },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  image: { type: String, required: true },
  classes: { type: String, default: 'tile' }
}, { _id: false });

const serviceCategorySchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String, default: '' },
  description: { type: String, default: '' }
}, { _id: false });

const settingsSchema = new mongoose.Schema({
  logoText: {
    type: String,
    default: 'Nilavi'
  },
  logoImageUrl: {
    type: String,
    default: ''
  },
  heroTagline: {
    type: String,
    default: 'Aesthetics and beauty studio, Chennai'
  },
  heroTitle: {
    type: String,
    default: 'Soft light for skin, hair and nails.'
  },
  heroSubtitle: {
    type: String,
    default: 'Gentle, personalized and unhurried treatments planned around your skin, hair care, makeup, and wellness goals.'
  },
  heroImageUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80'
  },
  serviceCategories: {
    type: [serviceCategorySchema],
    default: []
  },
  servicesImages: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      skin: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80',
      facial: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80',
      hair: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=900&q=80',
      nails: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=900&q=80',
      bridal: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80',
      wax: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80',
      wellness: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80'
    }
  },
  galleryImages: {
    type: [galleryImageSchema],
    default: [
      { id: 1, cat: 'bridal', title: 'Bridal glow', subtitle: 'Makeup and skin prep', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80', classes: 'tile arch-t tall' },
      { id: 2, cat: 'skin', title: 'Hydra glow facial', subtitle: 'Skin care', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80', classes: 'tile' },
      { id: 3, cat: 'hair', title: 'Colour melt & styling', subtitle: 'Hair care', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80', classes: 'tile' },
      { id: 4, cat: 'nails', title: 'Gold fleck gel set', subtitle: 'Nail artistry', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80', classes: 'tile arch-t tall' },
      { id: 5, cat: 'hair', title: 'Keratin smoothing & spa', subtitle: 'Hair care', image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1000&q=80', classes: 'tile wide' },
      { id: 6, cat: 'skin', title: 'Brightening botanical facial', subtitle: 'Skin care', image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80', classes: 'tile' },
      { id: 7, cat: 'nails', title: 'Luxury french manicure', subtitle: 'Nail artistry', image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80', classes: 'tile' },
      { id: 8, cat: 'bridal', title: 'Reception makeup & draping', subtitle: 'Bridal artistry', image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1000&q=80', classes: 'tile wide' }
    ]
  }
}, {
  timestamps: true,
  strict: false
});

export const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
export default Settings;
