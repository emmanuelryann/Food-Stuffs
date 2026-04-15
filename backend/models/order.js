import { Schema, model } from 'mongoose';

const orderSchema = new Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },

  customerName: {
    type: String
  },

  customerPhone: {
    type: String
  },

  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      name: {
        type: String,
        required: true },
      quantity: {
        type: Number,
        required: true },
      priceAtPurchase: {
        type: Number,
        required: true }
    }
  ],

  totalAmount: {
    type: Number,
    required: true },
  
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'cancelled'], 
    default: 'pending' 
  }
}, { timestamps: true });

export default model('Order', orderSchema);