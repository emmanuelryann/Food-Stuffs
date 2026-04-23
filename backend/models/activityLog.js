import { Schema, model } from 'mongoose';

const activityLogSchema = new Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'admin_signup',
      'admin_login',
      'admin_logout',
      'product_created',
      'product_updated',
      'product_deleted',
      'order_created',
      'order_status_updated',
      'order_deleted',
      'orders_bulk_deleted',
      'settings_updated',
      'click_intent',
    ]
  },

  performedBy: {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'Admin'
    },
    email: String,
    role: String
  },

  targetType: {
    type: String,
    enum: ['product', 'order', 'admin', 'system', 'settings']
  },

  targetId: {
    type: Schema.Types.Mixed
  },

  details: {
    type: String
  },

  metadata: {
    type: Schema.Types.Mixed
  },

  ipAddress: {
    type: String
  },

  deviceInfo: {
    type: String
  }

}, { timestamps: true });

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ 'performedBy.adminId': 1 });

export default model('ActivityLog', activityLogSchema);