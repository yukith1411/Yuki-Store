import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String },
  image: { type: String },
  active: { type: Boolean, default: true }
}, {
  timestamps: true
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
