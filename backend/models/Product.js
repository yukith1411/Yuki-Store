import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  discountPrice: { type: Number, min: 0, default: 0 },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  images: [{ type: String, required: true }],
  stock: { type: Number, required: true, min: 0, default: 0 },
  sizes: [{ type: String }],
  colors: [{ type: String }],
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  featured: { type: Boolean, default: false },
  newArrival: { type: Boolean, default: false },
  trending: { type: Boolean, default: false }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);
export default Product;
