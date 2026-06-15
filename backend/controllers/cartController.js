import User from '../models/User.js';
import { ApiError, asyncHandler } from '../utils/apiError.js';

// Helper to get populated cart
const getPopulatedCart = async (userId) => {
  const user = await User.findById(userId).populate({
    path: 'cart.product',
    select: 'name price discountPrice images stock sizes colors slug'
  });
  return user.cart;
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req, res, next) => {
  const cart = await getPopulatedCart(req.user._id);
  res.json({ success: true, cart });
});

// @desc    Add product to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity, size, color } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) return next(new ApiError(404, 'User not found'));

  // Check if item already exists with same size and color
  const existingItemIndex = user.cart.findIndex(
    (item) =>
      item.product.toString() === productId &&
      item.size === size &&
      item.color === color
  );

  if (existingItemIndex > -1) {
    user.cart[existingItemIndex].quantity += Number(quantity || 1);
  } else {
    user.cart.push({
      product: productId,
      quantity: Number(quantity || 1),
      size,
      color
    });
  }

  await user.save();
  const cart = await getPopulatedCart(user._id);
  res.json({ success: true, cart });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart
// @access  Private
export const updateCartItem = asyncHandler(async (req, res, next) => {
  const { productId, quantity, size, color } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) return next(new ApiError(404, 'User not found'));

  const itemIndex = user.cart.findIndex(
    (item) =>
      item.product.toString() === productId &&
      item.size === size &&
      item.color === color
  );

  if (itemIndex > -1) {
    user.cart[itemIndex].quantity = Number(quantity);
    if (user.cart[itemIndex].quantity <= 0) {
      user.cart.splice(itemIndex, 1);
    }
  } else {
    return next(new ApiError(404, 'Cart item not found'));
  }

  await user.save();
  const cart = await getPopulatedCart(user._id);
  res.json({ success: true, cart });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove
// @access  Private
export const removeFromCart = asyncHandler(async (req, res, next) => {
  const { productId, size, color } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) return next(new ApiError(404, 'User not found'));

  user.cart = user.cart.filter(
    (item) =>
      !(item.product.toString() === productId &&
        item.size === size &&
        item.color === color)
  );

  await user.save();
  const cart = await getPopulatedCart(user._id);
  res.json({ success: true, cart });
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new ApiError(404, 'User not found'));

  user.cart = [];
  await user.save();

  res.json({ success: true, cart: [] });
});
