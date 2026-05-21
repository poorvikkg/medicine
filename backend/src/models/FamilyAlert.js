const mongoose = require('mongoose');

const familyAlertSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    caregiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    alertType: {
      type: String,
      enum: ['missed_dose', 'repeated_miss', 'verification_fail', 'inactivity'],
      default: 'missed_dose',
    },
    missCount: { type: Number, default: 1 },
    relatedMedicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
    message: { type: String },
    resolved: { type: Boolean, default: false },
    resolvedAt: { type: Date },
    notifiedVia: [{ type: String, enum: ['fcm', 'email', 'sms'] }],
  },
  { timestamps: true }
);

familyAlertSchema.index({ patient: 1, resolved: 1, createdAt: -1 });
familyAlertSchema.index({ caregiver: 1, resolved: 1 });

module.exports = mongoose.model('FamilyAlert', familyAlertSchema);
