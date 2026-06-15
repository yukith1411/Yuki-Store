import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, required: true, enum: ['Percentage', 'Fixed'], default: 'Percentage' },
  discountAmount: { type: Number, required: true },
  minPurchase: { type: Number, required: true, default: 0 },
  expiryDate: { type: Date, required: true },
  active: { type: Boolean, default: true }
}, {
  timestamps: true
});

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
