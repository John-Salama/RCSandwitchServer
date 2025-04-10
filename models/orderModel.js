const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Order must belong to a user'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for faster queries
orderSchema.index({ userId: 1 });
orderSchema.index({ date: 1 });

// Virtual populate to get order items
orderSchema.virtual('items', {
  ref: 'OrderItem',
  foreignField: 'orderId',
  localField: '_id',
});

// Automatically populate items on find
orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'items',
    populate: {
      path: 'sandwich',
      select: 'name description price',
    },
  });
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
