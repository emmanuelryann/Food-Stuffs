import { Schema, model } from 'mongoose';

const productSchema = new Schema({
  productId: {
    type: String,
    unique: true,
    required: true
  },

  name: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  category: {
    type: String,
    required: true,
    enum: [
      'Fruits & Vegetables',
      'Dairy & Eggs',
      'Meat & Poultry',
      'Seafood',
      'Bakery & Bread',
      'Pantry & Grains',
      'Snacks & Sweets',
      'Beverages',
      'Frozen Foods',
      'Household & Cleaning'
    ],
    index: true
  },

  countInStock: {
    type: Number,
    default: 0
  },

  image: {
    url: String,
    fileId: String
  },

  inStock: {
    type: Boolean,
    default: true
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

export default model('Product', productSchema);