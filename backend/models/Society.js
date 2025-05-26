const mongoose = require('mongoose');

const societySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    pincode: {
      type: String,
      required: true,
      trim: true
    }
  },
  totalFlats: {
    type: Number,
    required: true,
    min: 1
  },
  amenities: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  maintenanceFee: {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    dueDate: {
      type: Number,
      required: true,
      min: 1,
      max: 31
    }
  },
  contactInfo: {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add index for faster queries
societySchema.index({ name: 1, 'address.city': 1 });

// Method to get public profile
societySchema.methods.getPublicProfile = function() {
  const society = this.toObject();
  delete society.__v;
  return society;
};

const Society = mongoose.model('Society', societySchema);

module.exports = Society;