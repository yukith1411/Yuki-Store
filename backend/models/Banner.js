import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  image: { type: String, required: true },
  link: { type: String },
  type: { type: String, required: true, enum: ['hero', 'offer'], default: 'hero' },
  active: { type: Boolean, default: true }
}, {
  timestamps: true
});

const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;
