import { Schema, model } from 'mongoose';

const storeSettingsSchema = new Schema({
  _id: {
    type: String,
    default: 'global_settings'
  },

  taxPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  deliveryFeePercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  fixedDeliveryFee: {
    type: Number,
    default: 0,
    min: 0
  },

  minOrderAmount: {
    type: Number,
    default: 0,
    min: 0
  },

  whatsappNumber: {
    type: String,
    default: ''
  },

  currencySymbol: {
    type: String,
    default: '$'
  },

  isStoreOpen: {
    type: Boolean,
    default: true
  },

  promoBanner: {
    type: String,
    default: ''
  },

  updatedBy: {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'Admin'
    },
    email: String
  }

}, { timestamps: true });

export default model('StoreSettings', storeSettingsSchema);
