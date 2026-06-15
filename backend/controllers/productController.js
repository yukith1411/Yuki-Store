import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import { ApiError, asyncHandler } from '../utils/apiError.js';
import { uploadMultipleToCloudinary } from '../utils/cloudinaryHelper.js';
import mongoose from 'mongoose';

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

// @desc    Get all products with filters, sorting, and pagination
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res, next) => {
  const {
    keyword,
    category,
    brand,
    minPrice,
    maxPrice,
    size,
    color,
    sort,
    page = 1,
    limit = 12,
    featured,
    newArrival,
    trending
  } = req.query;

  const query = {};

  // Search by keyword
  if (keyword) {
    query.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } }
    ];
  }

  // Category filter
  if (category) {
    if (mongoose.Types.ObjectId.isValid(category)) {
      query.category = category;
    } else {
      // Find category by slug
      const foundCategory = await Category.findOne({ slug: category });
      if (foundCategory) {
        query.category = foundCategory._id;
      } else {
        // If category slug is not found, return empty results
        return res.json({ success: true, products: [], page: 1, pages: 0, total: 0 });
      }
    }
  }

  // Brand filter
  if (brand) {
    if (mongoose.Types.ObjectId.isValid(brand)) {
      query.brand = brand;
    } else {
      // Find brand by slug
      const foundBrand = await Brand.findOne({ slug: brand });
      if (foundBrand) {
        query.brand = foundBrand._id;
      } else {
        return res.json({ success: true, products: [], page: 1, pages: 0, total: 0 });
      }
    }
  }

  // Price filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Size filter (expects comma separated values or single string)
  if (size) {
    const sizeList = size.split(',');
    query.sizes = { $in: sizeList };
  }

  // Color filter
  if (color) {
    const colorList = color.split(',');
    query.colors = { $in: colorList.map(c => new RegExp(`^${c}$`, 'i')) }; // Case-insensitive matching
  }

  // Tag filters
  if (featured === 'true') query.featured = true;
  if (newArrival === 'true') query.newArrival = true;
  if (trending === 'true') query.trending = true;

  // Sorting
  let sortQuery = { createdAt: -1 }; // Default: Newest
  if (sort) {
    if (sort === 'price-asc') sortQuery = { price: 1 };
    else if (sort === 'price-desc') sortQuery = { price: -1 };
    else if (sort === 'rating') sortQuery = { 'ratings.average': -1 };
    else if (sort === 'newest') sortQuery = { createdAt: -1 };
  }

  // Pagination
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('category', 'name slug')
    .populate('brand', 'name slug')
    .sort(sortQuery)
    .skip(skip)
    .limit(limitNum);

  res.json({
    success: true,
    products,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    total
  });
});

// @desc    Get single product by ID or slug
// @route   GET /api/products/:idOrSlug
// @access  Public
export const getProductByIdOrSlug = asyncHandler(async (req, res, next) => {
  const { idOrSlug } = req.params;
  let query = {};

  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    query._id = idOrSlug;
  } else {
    query.slug = idOrSlug;
  }

  const product = await Product.findOne(query)
    .populate('category', 'name slug')
    .populate('brand', 'name slug')
    .populate({
      path: 'reviews',
      populate: { path: 'user', select: 'name' }
    });

  if (!product) {
    return next(new ApiError(404, 'Product not found'));
  }

  res.json({ success: true, product });
});

// @desc    Create a product (Admin)
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res, next) => {
  const {
    name,
    description,
    price,
    discountPrice,
    brand,
    category,
    stock,
    sizes,
    colors,
    featured,
    newArrival,
    trending
  } = req.body;

  // Sizes and colors may be sent as JSON string or arrays
  const parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
  const parsedColors = typeof colors === 'string' ? JSON.parse(colors) : colors;

  if (!req.files || req.files.length === 0) {
    return next(new ApiError(400, 'Please upload at least one image'));
  }

  const filePaths = req.files.map((file) => file.path);
  const imageUrls = await uploadMultipleToCloudinary(filePaths, 'products');

  const slug = slugify(name) + '-' + Date.now().toString().slice(-4);

  const product = await Product.create({
    name,
    slug,
    description,
    price: Number(price),
    discountPrice: discountPrice ? Number(discountPrice) : 0,
    brand,
    category,
    stock: Number(stock),
    sizes: parsedSizes || [],
    colors: parsedColors || [],
    images: imageUrls,
    featured: featured === 'true' || featured === true,
    newArrival: newArrival === 'true' || newArrival === true,
    trending: trending === 'true' || trending === true
  });

  res.status(201).json({ success: true, product });
});

// @desc    Update a product (Admin)
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res, next) => {
  const {
    name,
    description,
    price,
    discountPrice,
    brand,
    category,
    stock,
    sizes,
    colors,
    featured,
    newArrival,
    trending,
    existingImages // Array of image URLs to keep (sent as string/array)
  } = req.body;

  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ApiError(404, 'Product not found'));
  }

  if (name) {
    product.name = name;
    product.slug = slugify(name) + '-' + product._id.toString().slice(-4);
  }
  if (description) product.description = description;
  if (price !== undefined) product.price = Number(price);
  if (discountPrice !== undefined) product.discountPrice = Number(discountPrice);
  if (brand) product.brand = brand;
  if (category) product.category = category;
  if (stock !== undefined) product.stock = Number(stock);

  if (sizes) {
    product.sizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
  }
  if (colors) {
    product.colors = typeof colors === 'string' ? JSON.parse(colors) : colors;
  }

  if (featured !== undefined) product.featured = featured === 'true' || featured === true;
  if (newArrival !== undefined) product.newArrival = newArrival === 'true' || newArrival === true;
  if (trending !== undefined) product.trending = trending === 'true' || trending === true;

  // Handle images
  let updatedImages = [];
  if (existingImages) {
    updatedImages = typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages;
  } else {
    // If not provided, we default to retaining current images
    updatedImages = product.images;
  }

  // If new files are uploaded, upload them and merge
  if (req.files && req.files.length > 0) {
    const filePaths = req.files.map((file) => file.path);
    const newImageUrls = await uploadMultipleToCloudinary(filePaths, 'products');
    updatedImages = [...updatedImages, ...newImageUrls];
  }

  if (updatedImages.length === 0) {
    return next(new ApiError(400, 'Product must have at least one image'));
  }

  product.images = updatedImages;
  const updatedProduct = await product.save();

  res.json({ success: true, product: updatedProduct });
});

// @desc    Delete a product (Admin)
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ApiError(404, 'Product not found'));
  }

  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Product deleted successfully' });
});
