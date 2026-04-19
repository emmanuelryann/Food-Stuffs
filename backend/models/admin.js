import { Schema, model } from 'mongoose';

const adminSchema = new Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  isEmailVerified: {
    type: Boolean,
    default: false
  },

  password: {
    type: String,
    required: true,
    minlength: 5,
  },

  role: {
    type: String,
    enum: ['admin', 'super_admin'],
    default: 'admin'
  },

  status: {
    type: String,
    enum: ['active', 'deactivated', 'suspended', 'deleted'],
    default: 'active'
  },

  loginAttempts: {
    type: Number,
    default: 0
  },

  lockUntil: Date,

  passwordResetToken: String,

  passwordResetExpires: Date,

  permissions: [String],

  lastLogin: Date
  },

  { timestamps: true }
);

export default model("Admin", adminSchema);