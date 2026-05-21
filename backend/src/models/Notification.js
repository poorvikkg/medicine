const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: {
      type: String,
      enum: ['reminder', 'missed', 'verification', 'family_alert', 'system'],
      default: 'reminder',
    },
    relatedMedicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
    relatedLog: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicineLog' },
    isRead: { type: Boolean, default: false },
    deliveredViaFCM: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
