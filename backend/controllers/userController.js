import User from '../models/User.js';
import { ApiError, asyncHandler } from '../utils/apiError.js';

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({}).select('-password');
  res.json({ success: true, users });
});

// @desc    Toggle user block status (Admin)
// @route   PUT /api/users/:id/block
// @access  Private/Admin
export const toggleBlockUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  if (user.role === 'admin') {
    return next(new ApiError(400, 'Cannot block an admin user'));
  }

  user.isBlocked = !user.isBlocked;
  await user.save();

  res.json({
    success: true,
    message: `User has been ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
    user,
  });
});

// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  if (user.role === 'admin') {
    return next(new ApiError(400, 'Cannot delete an admin user'));
  }

  await User.findByIdAndDelete(req.params.id);

  res.json({ success: true, message: 'User deleted successfully' });
});
