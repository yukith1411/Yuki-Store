import Category from '../models/Category.js';
import { ApiError, asyncHandler } from '../utils/apiError.js';
import { uploadSingleToCloudinary } from '../utils/cloudinaryHelper.js';

// Helper to generate slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find({});
  res.json({ success: true, categories });
});

// @desc    Create a category (Admin)
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;

  const categoryExists = await Category.findOne({ name });
  if (categoryExists) {
    return next(new ApiError(400, 'Category already exists'));
  }

  let imageUrl = '';
  if (req.file) {
    imageUrl = await uploadSingleToCloudinary(req.file.path, 'categories');
  }

  const category = await Category.create({
    name,
    slug: slugify(name),
    description,
    image: imageUrl,
  });

  res.status(201).json({ success: true, category });
});

// @desc    Update a category (Admin)
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res, next) => {
  const { name, description, active } = req.body;
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ApiError(404, 'Category not found'));
  }

  if (name) {
    category.name = name;
    category.slug = slugify(name);
  }
  if (description !== undefined) category.description = description;
  if (active !== undefined) category.active = active;

  if (req.file) {
    category.image = await uploadSingleToCloudinary(req.file.path, 'categories');
  }

  const updatedCategory = await category.save();
  res.json({ success: true, category: updatedCategory });
});

// @desc    Delete a category (Admin)
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ApiError(404, 'Category not found'));
  }

  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Category deleted successfully' });
});
