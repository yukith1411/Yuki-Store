import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { ApiError, asyncHandler } from '../utils/apiError.js';

// Helper to recalculate ratings for a product
const updateProductRatings = async (productId) => {
  const reviews = await Review.find({ product: productId });
  const count = reviews.length;
  let average = 0;

  if (count > 0) {
    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    average = Number((sum / count).toFixed(1));
  }

  await Product.findByIdAndUpdate(productId, {
    'ratings.average': average,
    'ratings.count': count,
  });
};

// @desc    Create a product review
// @route   POST /api/reviews
// @access  Private
export const createReview = asyncHandler(async (req, res, next) => {
  const { productId, rating, comment } = req.body;

  if (!rating || !comment) {
    return next(new ApiError(400, 'Please provide both rating and comment'));
  }

  const product = await Product.findById(productId);
  if (!product) {
    return next(new ApiError(404, 'Product not found'));
  }

  // Check if user has already reviewed the product
  const alreadyReviewed = await Review.findOne({
    product: productId,
    user: req.user._id,
  });

  if (alreadyReviewed) {
    return next(new ApiError(400, 'Product already reviewed by you'));
  }

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  });

  // Link review to product
  product.reviews.push(review._id);
  await product.save();

  // Recalculate average ratings
  await updateProductRatings(productId);

  res.status(201).json({ success: true, message: 'Review added successfully', review });
});

// @desc    Get all reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'name')
    .sort({ createdAt: -1 });

  res.json({ success: true, reviews });
});

// @desc    Delete a review (Admin)
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
export const deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return next(new ApiError(404, 'Review not found'));
  }

  const productId = review.product;

  // Unlink review from product
  await Product.findByIdAndUpdate(productId, {
    $pull: { reviews: req.params.id }
  });

  await Review.findByIdAndDelete(req.params.id);

  // Recalculate average ratings
  await updateProductRatings(productId);

  res.json({ success: true, message: 'Review deleted successfully' });
});

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews
// @access  Private/Admin
export const getAllReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({})
    .populate('product', 'name slug')
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  res.json({ success: true, reviews });
});
