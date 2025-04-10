const Sandwich = require('../models/sandwichModel');
const OrderItem = require('../models/orderItemModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Get all sandwiches
exports.getAllSandwiches = catchAsync(async (req, res, next) => {
  const sandwiches = await Sandwich.find().sort({ name: 1 });

  res.status(200).json({
    status: 'success',
    results: sandwiches.length,
    data: sandwiches,
  });
});

// Get a single sandwich by ID
exports.getSandwich = catchAsync(async (req, res, next) => {
  const sandwich = await Sandwich.findById(req.params.id);

  if (!sandwich) {
    return next(new AppError('No sandwich found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: sandwich,
  });
});

// Create a new sandwich
exports.createSandwich = catchAsync(async (req, res, next) => {
  // Validate required fields
  if (
    !req.body.name ||
    typeof req.body.price !== 'number' ||
    req.body.price <= 0
  ) {
    return next(new AppError('Name and valid price are required', 400));
  }

  const newSandwich = await Sandwich.create({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
  });

  res.status(201).json({
    status: 'success',
    data: newSandwich,
  });
});

// Update a sandwich
exports.updateSandwich = catchAsync(async (req, res, next) => {
  // Check if we have valid fields to update
  if (
    (!req.body.name &&
      req.body.description === undefined &&
      req.body.price === undefined) ||
    (req.body.price !== undefined &&
      (typeof req.body.price !== 'number' || req.body.price <= 0))
  ) {
    return next(new AppError('Valid fields are required for update', 400));
  }

  const updateData = {};
  if (req.body.name) updateData.name = req.body.name;
  if (req.body.description !== undefined)
    updateData.description = req.body.description;
  if (req.body.price !== undefined) updateData.price = req.body.price;

  const sandwich = await Sandwich.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!sandwich) {
    return next(new AppError('No sandwich found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: sandwich,
  });
});

// Delete a sandwich
exports.deleteSandwich = catchAsync(async (req, res, next) => {
  // Check if sandwich exists
  const sandwich = await Sandwich.findById(req.params.id);

  if (!sandwich) {
    return next(new AppError('No sandwich found with that ID', 404));
  }

  // Check if sandwich is used in any order
  const orderWithSandwich = await OrderItem.findOne({
    sandwichId: req.params.id,
  });

  if (orderWithSandwich) {
    return next(
      new AppError('Cannot delete sandwich that has been ordered', 400)
    );
  }

  await Sandwich.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Sandwich deleted successfully',
  });
});
