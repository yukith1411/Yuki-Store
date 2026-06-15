import Banner from '../models/Banner.js';
import { ApiError, asyncHandler } from '../utils/apiError.js';
import { uploadSingleToCloudinary } from '../utils/cloudinaryHelper.js';

// @desc    Get active banners (Public)
// @route   GET /api/banners
// @access  Public
export const getActiveBanners = asyncHandler(async (req, res, next) => {
  const banners = await Banner.find({ active: true });
  res.json({ success: true, banners });
});

// @desc    Get all banners (Admin)
// @route   GET /api/banners/all
// @access  Private/Admin
export const getAllBanners = asyncHandler(async (req, res, next) => {
  const banners = await Banner.find({}).sort({ createdAt: -1 });
  res.json({ success: true, banners });
});

// @desc    Create a banner (Admin)
// @route   POST /api/banners
// @access  Private/Admin
export const createBanner = asyncHandler(async (req, res, next) => {
  const { title, subtitle, link, type } = req.body;

  if (!req.file) {
    return next(new ApiError(400, 'Please upload a banner image'));
  }

  const imageUrl = await uploadSingleToCloudinary(req.file.path, 'banners');

  const banner = await Banner.create({
    title,
    subtitle,
    link,
    type: type || 'hero',
    image: imageUrl,
  });

  res.status(201).json({ success: true, banner });
});

// @desc    Update a banner (Admin)
// @route   PUT /api/banners/:id
// @access  Private/Admin
export const updateBanner = asyncHandler(async (req, res, next) => {
  const { title, subtitle, link, type, active } = req.body;
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    return next(new ApiError(404, 'Banner not found'));
  }

  if (title !== undefined) banner.title = title;
  if (subtitle !== undefined) banner.subtitle = subtitle;
  if (link !== undefined) banner.link = link;
  if (type !== undefined) banner.type = type;
  if (active !== undefined) banner.active = active;

  if (req.file) {
    banner.image = await uploadSingleToCloudinary(req.file.path, 'banners');
  }

  const updatedBanner = await banner.save();
  res.json({ success: true, banner: updatedBanner });
});

// @desc    Delete a banner (Admin)
// @route   DELETE /api/banners/:id
// @access  Private/Admin
export const deleteBanner = asyncHandler(async (req, res, next) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) {
    return next(new ApiError(404, 'Banner not found'));
  }

  await Banner.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Banner deleted successfully' });
});
