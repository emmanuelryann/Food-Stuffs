import { Schema, model } from 'mongoose';

const adminSchema = new Schema({
  firstName: {
    type: String,
    required: [true],
    trim: true
  },

  lastName: {
    type: String,
    required: [true],
    trim: true
  },

  phoneNumber: {
    type: String,
    required: [true],
    unique: true,
  },

  email: {
    type: String,
    required: [true],
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: [true],
    minlength: 6,
    select: false
  }
  
},
  { timestamps: true }
);

export default model('Admin', adminSchema);