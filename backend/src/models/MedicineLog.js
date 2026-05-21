const mongoose = require('mongoose');

const medicinLogSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    scheduledTime: { type: Date, required: true },
    takenTime: { type: Date },
    status: {
      type: String,
      enum: ['pending', 'taken', 'missed', 'snoozed'],
      default: 'pending',
    },
    verificationImage: { type: String }, // uploaded by patient for AI check
    verificationResult: {
      isCorrect: { type: Boolean },
      confidence: { type: Number }, // 0-100
      message: { type: String },
      colorMatch: { type: Boolean },
      shapeMatch: { type: Boolean },
      ocrMatch: { type: Boolean },
    },
    notes: { type: String },
    missedAlertSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

medicinLogSchema.index({ patient: 1, scheduledTime: -1 });
medicinLogSchema.index({ medicine: 1, status: 1 });
medicinLogSchema.index({ patient: 1, status: 1, scheduledTime: -1 });

module.exports = mongoose.model('MedicineLog', medicinLogSchema);
