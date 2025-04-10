const mongoose = require('mongoose');

const sandwichSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A sandwich must have a name'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'A sandwich must have a price'],
      min: [0, 'Price must be above 0'],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate to get orderItems referencing this sandwich
sandwichSchema.virtual('orderItems', {
  ref: 'OrderItem',
  foreignField: 'sandwichId',
  localField: '_id',
});

const Sandwich = mongoose.model('Sandwich', sandwichSchema);

module.exports = Sandwich;
