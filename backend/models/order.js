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

  customerAddress: {
    type: String,
    required: true
  },

  items: [
    {
      productId: {
        type: String,
        ref: 'Product'
      },
      name: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      priceAtPurchase: {
        type: Number,
        required: true
      }
    }
  ],

  deliveryFee: {
    type: Number,
    default: 0
  },

  totalAmount: {
    type: Number,
    required: true
  },
  
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'cancelled'], 
    default: 'pending' 
  }
},

{ timestamps: true });

export default model('Order', orderSchema);