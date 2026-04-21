import { Schema, model } from 'mongoose';

const adminSessionSchema = new Schema({
  adminId: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },

  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },

  role: {
    type: String,
    enum: ['admin', 'super_admin'],
    default: 'admin'
  },

  token: {
    type: String,
    required: true,
    unique: true,
  },

  deviceInfo: {
    type: String,
    default: "Unknown Device",
  },

  ipAddress: {
    type: String,
    default: "Unknown IP",
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  expiresAt: {
    type: Date,
    required: true,
  },
},

	{ timestamps: true },
);

// Index to automatically delete expired sessions
adminSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model("AdminSession", adminSessionSchema);