import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String },
  logo: { type: String },
  active: { type: Boolean, default: true }
}, {
  timestamps: true
});

const Brand = mongoose.model('Brand', brandSchema);
export default Brand;
