import Coupon from '../models/Coupon.js';
import { ApiError, asyncHandler } from '../utils/apiError.js';

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Private
export const validateCoupon = asyncHandler(async (req, res, next) => {
  const { code, subtotal } = req.body;

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });

  if (!coupon) {
    return next(new ApiError(404, 'Invalid or inactive coupon code'));
  }

  // Check expiration
  if (new Date(coupon.expiryDate) < new Date()) {
    return next(new ApiError(400, 'This coupon has expired'));
  }

  // Check minimum purchase amount
  if (subtotal < coupon.minPurchase) {
    return next(new ApiError(400, `Minimum purchase of ₹${coupon.minPurchase} is required to apply this coupon`));
  }

  // Calculate discount
  let discount = 0;
  if (coupon.discountType === 'Percentage') {
    discount = Math.round((subtotal * coupon.discountAmount) / 100);
  } else {
    discount = coupon.discountAmount;
  }

  // Ensure discount does not exceed subtotal
  if (discount > subtotal) {
    discount = subtotal;
  }

  res.json({
    success: true,
    message: 'Coupon applied successfully',
    coupon: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountAmount: coupon.discountAmount,
      discountVal: discount
    }
  });
});

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
// @access  Private/Admin
export const getCoupons = asyncHandler(async (req, res, next) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });
  res.json({ success: true, coupons });
});

// @desc    Create a coupon (Admin)
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = asyncHandler(async (req, res, next) => {
  const { code, discountType, discountAmount, minPurchase, expiryDate } = req.body;

  const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
  if (couponExists) {
    return next(new ApiError(400, 'Coupon code already exists'));
  }

  const coupon = await Coupon.create({
    code,
    discountType,
    discountAmount: Number(discountAmount),
    minPurchase: minPurchase ? Number(minPurchase) : 0,
    expiryDate: new Date(expiryDate),
  });

  res.status(201).json({ success: true, coupon });
});

// @desc    Update a coupon (Admin)
// @route   PUT /api/coupons/:id
// @access  Private/Admin
export const updateCoupon = asyncHandler(async (req, res, next) => {
  const { code, discountType, discountAmount, minPurchase, expiryDate, active } = req.body;

  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    return next(new ApiError(404, 'Coupon not found'));
  }

  if (code) coupon.code = code.toUpperCase();
  if (discountType) coupon.discountType = discountType;
  if (discountAmount !== undefined) coupon.discountAmount = Number(discountAmount);
  if (minPurchase !== undefined) coupon.minPurchase = Number(minPurchase);
  if (expiryDate) coupon.expiryDate = new Date(expiryDate);
  if (active !== undefined) coupon.active = active;

  const updatedCoupon = await coupon.save();
  res.json({ success: true, coupon: updatedCoupon });
});

// @desc    Delete a coupon (Admin)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    return next(new ApiError(404, 'Coupon not found'));
  }

  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Coupon deleted successfully' });
});
