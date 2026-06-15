import User from '../models/User.js';
import { ApiError, asyncHandler } from '../utils/apiError.js';

// Helper to get populated wishlist
const getPopulatedWishlist = async (userId) => {
  const user = await User.findById(userId).populate({
    path: 'wishlist',
    select: 'name price discountPrice images stock slug'
  });
  return user.wishlist;
};

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = asyncHandler(async (req, res, next) => {
  const wishlist = await getPopulatedWishlist(req.user._id);
  res.json({ success: true, wishlist });
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
export const addToWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) return next(new ApiError(404, 'User not found'));

  if (!user.wishlist.includes(productId)) {
    user.wishlist.push(productId);
    await user.save();
  }

  const wishlist = await getPopulatedWishlist(user._id);
  res.json({ success: true, wishlist });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:id
// @access  Private
export const removeFromWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) return next(new ApiError(404, 'User not found'));

  user.wishlist = user.wishlist.filter(
    (id) => id.toString() !== req.params.id
  );

  await user.save();
  const wishlist = await getPopulatedWishlist(user._id);
  res.json({ success: true, wishlist });
});
