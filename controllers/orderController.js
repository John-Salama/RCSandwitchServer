const Order = require('../models/orderModel');
const OrderItem = require('../models/orderItemModel');
const User = require('../models/userModel');
const Sandwich = require('../models/sandwichModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const bcrypt = require('bcrypt');

// Get all orders (admin only)
exports.getAllOrders = catchAsync(async (req, res, next) => {
  const { date } = req.query;

  // Parse the date if provided
  let dateQuery = {};
  if (date) {
    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    dateQuery = {
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    };
  }

  const orders = await Order.find(dateQuery)
    .populate({
      path: 'userId',
      select: 'name',
    })
    .sort({ date: 1 });

  // Transform to match the expected format
  const formattedOrders = orders.map((order) => ({
    id: order._id,
    user: {
      id: order.userId._id,
      name: order.userId.name,
    },
    date: order.date,
    items: order.items.map((item) => {
      // Check if item.sandwichId exists before accessing its properties
      if (!item.sandwichId) {
        return {
          id: item._id,
          quantity: item.quantity,
          price: item.price,
          sandwich: null,
        };
      }

      return {
        id: item._id,
        quantity: item.quantity,
        price: item.price,
        sandwich: {
          id: item.sandwichId._id,
          name: item.sandwichId.name,
          price: item.sandwichId.price,
          description: item.sandwichId.description,
        },
      };
    }),
  }));

  res.status(200).json(formattedOrders);
});

// Get orders for a specific user
exports.getUserOrders = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { date } = req.query;

  // Validate user ID
  if (!userId) {
    return next(new AppError('User ID is required', 400));
  }

  // Parse the date if provided
  let dateQuery = { userId };
  if (date) {
    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    dateQuery.date = {
      $gte: startOfDay,
      $lte: endOfDay,
    };
  }

  const orders = await Order.find(dateQuery)
    .populate({
      path: 'userId',
      select: 'name',
    })
    .sort({ date: -1 }); // Most recent orders first

  // Transform to match the expected format
  const formattedOrders = orders.map((order) => ({
    id: order._id,
    user: {
      id: order.userId._id,
      name: order.userId.name,
    },
    date: order.date,
    status: order.status,
    items: order.items.map((item) => {
      // Check if item.sandwichId exists before accessing its properties
      if (!item.sandwichId) {
        return {
          id: item._id,
          quantity: item.quantity,
          price: item.price,
          sandwich: null,
        };
      }

      return {
        id: item._id,
        quantity: item.quantity,
        price: item.price,
        sandwich: {
          id: item.sandwichId._id,
          name: item.sandwichId.name,
          price: item.sandwichId.price,
          description: item.sandwichId.description,
        },
      };
    }),
  }));

  res.status(200).json(formattedOrders);
});

// Create a new order
exports.createOrder = catchAsync(async (req, res, next) => {
  const { userName, userId, items } = req.body;

  // Validate required fields
  if (!items || !Array.isArray(items) || items.length === 0) {
    return next(new AppError('At least one sandwich is required', 400));
  }

  // Check if all sandwiches exist
  const sandwichIds = items.map((item) => item.sandwichId);
  const sandwiches = await Sandwich.find({ _id: { $in: sandwichIds } });

  if (sandwiches.length !== new Set(sandwichIds).size) {
    return next(new AppError('One or more sandwiches do not exist', 400));
  }

  // Find user by ID first if provided
  let user;
  if (userId) {
    user = await User.findById(userId);
  }

  // If user not found by ID but userName provided, find or create by name
  if (!user && userName) {
    user = await User.findOne({ name: userName });

    if (!user) {
      // Generate a random email and hashed password
      const randomEmail = `${userName.replace(
        /\s+/g,
        ''
      )}_${Date.now()}@example.com`;
      const hashedPassword = await bcrypt.hash('password123', 10);

      user = await User.create({
        name: userName,
        email: randomEmail,
        password: hashedPassword,
        isAdmin: false,
      });
    }
  }

  if (!user) {
    return next(new AppError('Valid user ID or name is required', 400));
  }

  // Create order
  const order = await Order.create({
    userId: user._id,
  });

  // Create order items
  const orderItems = await Promise.all(
    items.map(async (item) => {
      const sandwich = sandwiches.find(
        (s) => s._id.toString() === item.sandwichId
      );
      return OrderItem.create({
        orderId: order._id,
        sandwichId: item.sandwichId,
        quantity: item.quantity,
        price: sandwich.price,
      });
    })
  );

  // Populate order with user and items
  const populatedOrder = await Order.findById(order._id).populate({
    path: 'userId',
    select: 'name',
  });

  // Transform order to match expected format
  const formattedOrder = {
    id: populatedOrder._id,
    user: {
      id: populatedOrder.userId._id,
      name: populatedOrder.userId.name,
    },
    date: populatedOrder.date,
    status: populatedOrder.status,
    items: orderItems.map((item) => ({
      id: item._id,
      sandwichId: item.sandwichId,
      quantity: item.quantity,
      price: item.price,
      sandwich: sandwiches.find(
        (s) => s._id.toString() === item.sandwichId.toString()
      ),
    })),
  };

  res.status(201).json(formattedOrder);
});

// Get admin stats
exports.getAdminStats = catchAsync(async (req, res, next) => {
  // Get total sandwiches
  const totalSandwiches = await Sandwich.countDocuments();

  // Get total orders for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const totalOrders = await Order.countDocuments({
    date: {
      $gte: today,
      $lt: tomorrow,
    },
  });

  // Get total unique users
  const totalUsers = await User.countDocuments();

  res.status(200).json({
    totalSandwiches,
    totalOrders,
    totalUsers,
  });
});
