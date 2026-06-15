import Brand from '../models/Brand.js';
import { ApiError, asyncHandler } from '../utils/apiError.js';
import { uploadSingleToCloudinary } from '../utils/cloudinaryHelper.js';

// Helper to generate slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
export const getBrands = asyncHandler(async (req, res, next) => {
  const brands = await Brand.find({});
  res.json({ success: true, brands });
});

// @desc    Create a brand (Admin)
// @route   POST /api/brands
// @access  Private/Admin
export const createBrand = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;

  const brandExists = await Brand.findOne({ name });
  if (brandExists) {
    return next(new ApiError(400, 'Brand already exists'));
  }

  let logoUrl = '';
  if (req.file) {
    logoUrl = await uploadSingleToCloudinary(req.file.path, 'brands');
  }

  const brand = await Brand.create({
    name,
    slug: slugify(name),
    description,
    logo: logoUrl,
  });

  res.status(201).json({ success: true, brand });
});

// @desc    Update a brand (Admin)
// @route   PUT /api/brands/:id
// @access  Private/Admin
export const updateBrand = asyncHandler(async (req, res, next) => {
  const { name, description, active } = req.body;
  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    return next(new ApiError(404, 'Brand not found'));
  }

  if (name) {
    brand.name = name;
    brand.slug = slugify(name);
  }
  if (description !== undefined) brand.description = description;
  if (active !== undefined) brand.active = active;

  if (req.file) {
    brand.logo = await uploadSingleToCloudinary(req.file.path, 'brands');
  }

  const updatedBrand = await brand.save();
  res.json({ success: true, brand: updatedBrand });
});

// @desc    Delete a brand (Admin)
// @route   DELETE /api/brands/:id
// @access  Private/Admin
export const deleteBrand = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    return next(new ApiError(404, 'Brand not found'));
  }

  await Brand.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Brand deleted successfully' });
});
