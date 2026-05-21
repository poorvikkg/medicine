const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'admin', 'caregiver'],
      default: 'patient',
    },
    phone: { type: String, trim: true },
    dateOfBirth: { type: Date },
    profileImage: { type: String },

    // Patient-specific
    medicalId: { type: String, unique: true, sparse: true },
    caregivers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // FCM token for push notifications
    fcmToken: { type: String },

    // Language preference for voice assistant
    language: { type: String, default: 'en-IN' },

    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
