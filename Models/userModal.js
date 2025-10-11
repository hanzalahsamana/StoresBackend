const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      default: '',
    },
    lastName: {
      type: String,
      default: '',
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    otp: {
      type: String,
    },

    otpExpiration: {
      type: Date,
    },

    lastOtpSentAt: {
      type: Date,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    method: {
      type: String,
      enum: ['email', 'google'],
      default: 'email',
    },

    role: {
      type: String,
      enum: ['admin', 'superAdmin'],
      default: 'admin',
      required: true,
    },

    status: {
      type: String,
      required: true,
      default: 'active',
      enum: ['active', 'suspended'],
    },

    lastOpenedStore: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      default: null,
    },
    suspendedReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const UserModal = mongoose.model('User', userSchema);

module.exports = { UserModal };
