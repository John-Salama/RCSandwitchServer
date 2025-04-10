const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Order',
      required: [true, 'Order item must belong to an order'],
    },
    sandwichId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Sandwich',
      required: [true, 'Order item must have a sandwich'],
    },
    quantity: {
      type: Number,
      required: [true, 'Order item must have a quantity'],
      min: [1, 'Quantity must be at least 1'],
    },
    price: {
      type: Number,
      required: [true, 'Order item must have a price'],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for faster queries
orderItemSchema.index({ orderId: 1 });
orderItemSchema.index({ sandwichId: 1 });

// Populate sandwich when querying order items
orderItemSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'sandwichId',
    select: 'name description price',
  });
  next();
});

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

module.exports = OrderItem;
