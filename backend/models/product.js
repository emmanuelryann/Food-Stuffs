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

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

export default model('Product', productSchema);