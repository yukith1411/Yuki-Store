import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { ApiError, asyncHandler } from '../utils/apiError.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res, next) => {
  const {
    products,
    address,
    paymentMethod,
    subtotal,
    discount,
    total,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  } = req.body;

  if (!products || products.length === 0) {
    return next(new ApiError(400, 'No products in order'));
  }

  // Verify stock availability and decrement
  for (const item of products) {
    const product = await Product.findById(item.product);
    if (!product) {
      return next(new ApiError(404, `Product ${item.name} not found`));
    }
    if (product.stock < item.quantity) {
      return next(new ApiError(400, `Product ${product.name} is out of stock or insufficient quantity available.`));
    }
  }

  // Decrement stock
  for (const item of products) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity }
    });
  }

  const order = await Order.create({
    user: req.user._id,
    products,
    address,
    paymentMethod,
    paymentStatus: paymentMethod === 'Razorpay' ? 'Completed' : 'Pending',
    orderStatus: 'Pending',
    subtotal,
    discount,
    total,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  });

  // Clear user's cart
  const user = await User.findById(req.user._id);
  user.cart = [];
  await user.save();

  res.status(201).json({ success: true, order });
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

// @desc    Get order by ID (Invoice)
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email mobile');

  if (!order) {
    return next(new ApiError(404, 'Order not found'));
  }

  // Allow only the user who placed it or an admin to access details
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new ApiError(403, 'Not authorized to view this order'));
  }

  res.json({ success: true, order });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ApiError(404, 'Order not found'));
  }

  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new ApiError(403, 'Not authorized to cancel this order'));
  }

  if (order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered') {
    return next(new ApiError(400, `Cannot cancel order that has already been ${order.orderStatus.toLowerCase()}`));
  }

  if (order.orderStatus === 'Cancelled') {
    return next(new ApiError(400, 'Order is already cancelled'));
  }

  // Restore product stock
  for (const item of order.products) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity }
    });
  }

  order.orderStatus = 'Cancelled';
  await order.save();

  res.json({ success: true, message: 'Order cancelled successfully', order });
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({})
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  res.json({ success: true, orders });
});

// @desc    Update order status and payment status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { orderStatus, paymentStatus } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ApiError(404, 'Order not found'));
  }

  // If status is transitioning to Cancelled and was not Cancelled before, restore stock
  if (orderStatus === 'Cancelled' && order.orderStatus !== 'Cancelled') {
    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }
  }

  // If status is transitioning FROM Cancelled (rare but possible by admin override) back to active, decrement stock
  if (order.orderStatus === 'Cancelled' && orderStatus && orderStatus !== 'Cancelled') {
    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }
  }

  if (orderStatus) order.orderStatus = orderStatus;
  if (paymentStatus) order.paymentStatus = paymentStatus;

  const updatedOrder = await order.save();
  res.json({ success: true, message: 'Order status updated', order: updatedOrder });
});
