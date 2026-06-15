import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { ApiError, asyncHandler } from '../utils/apiError.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, mobile } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new ApiError(400, 'User already exists with this email'));
  }

  const user = await User.create({
    name,
    email,
    password,
    mobile,
    role: 'user', // Default role is user
  });

  if (user) {
    res.status(201).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      mobile: user.mobile,
      token: generateToken(user._id, user.role),
    });
  } else {
    return next(new ApiError(400, 'Invalid user data'));
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && user.isBlocked) {
    return next(new ApiError(403, 'Your account has been blocked by the admin'));
  }

  if (user && (await user.matchPassword(password))) {
    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      mobile: user.mobile,
      token: generateToken(user._id, user.role),
    });
  } else {
    return next(new ApiError(401, 'Invalid email or password'));
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      mobile: user.mobile,
      addresses: user.addresses,
      wishlist: user.wishlist,
      cart: user.cart,
    });
  } else {
    return next(new ApiError(404, 'User not found'));
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.mobile = req.body.mobile || user.mobile;

    const updatedUser = await user.save();

    res.json({
      success: true,
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      mobile: updatedUser.mobile,
      addresses: updatedUser.addresses,
    });
  } else {
    return next(new ApiError(404, 'User not found'));
  }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (user && (await user.matchPassword(currentPassword))) {
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } else {
    return next(new ApiError(401, 'Incorrect current password'));
  }
});

// @desc    Forgot Password Mock Link Generator
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new ApiError(404, 'User not found with this email'));
  }

  // Generate a mock reset token
  const resetToken = generateToken(user._id, user.role);

  res.json({
    success: true,
    message: 'Reset link generated successfully. (Dev note: Use the attached token to reset).',
    resetToken,
    resetLink: `http://localhost:5173/reset-password?token=${resetToken}`
  });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { token, password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    user.password = password;
    await user.save();

    res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    return next(new ApiError(400, 'Invalid or expired token'));
  }
});

// Address Subdocument management

// @desc    Add shipping address
// @route   POST /api/auth/addresses
// @access  Private
export const addAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new ApiError(404, 'User not found'));

  const { street, city, state, zipCode, country } = req.body;
  user.addresses.push({ street, city, state, zipCode, country });

  const updatedUser = await user.save();
  res.status(201).json({ success: true, addresses: updatedUser.addresses });
});

// @desc    Update shipping address
// @route   PUT /api/auth/addresses/:id
// @access  Private
export const updateAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new ApiError(404, 'User not found'));

  const address = user.addresses.id(req.params.id);
  if (!address) return next(new ApiError(404, 'Address not found'));

  address.street = req.body.street || address.street;
  address.city = req.body.city || address.city;
  address.state = req.body.state || address.state;
  address.zipCode = req.body.zipCode || address.zipCode;
  address.country = req.body.country || address.country;

  const updatedUser = await user.save();
  res.json({ success: true, addresses: updatedUser.addresses });
});

// @desc    Delete shipping address
// @route   DELETE /api/auth/addresses/:id
// @access  Private
export const deleteAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new ApiError(404, 'User not found'));

  // Use filter to remove the address
  user.addresses = user.addresses.filter(
    (addr) => addr._id.toString() !== req.params.id
  );

  const updatedUser = await user.save();
  res.json({ success: true, addresses: updatedUser.addresses });
});
