const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  time: { type: String, required: true }, // "08:00", "14:00", "21:00"
  label: { type: String, enum: ['morning', 'afternoon', 'evening', 'night'], default: 'morning' },
  beforeFood: { type: Boolean, default: false },
});

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    genericName: { type: String, trim: true },
    dosage: { type: String, required: true }, // "500mg", "1 tablet"
    dosageUnit: { type: String, default: 'tablet' },
    quantity: { type: Number, default: 1 },
    instructions: { type: String, trim: true }, // "Take with warm water"
    sideEffects: { type: String, trim: true },

    // Scheduling
    schedule: [scheduleSchema],
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    daysOfWeek: [{ type: Number, min: 0, max: 6 }], // 0=Sun, 1=Mon, etc. Empty = daily

    // Images
    medicineImage: { type: String }, // Cloudinary URL
    medicineImagePublicId: { type: String },
    stripImage: { type: String },
    stripImagePublicId: { type: String },

    // AI verification data
    colorProfile: { type: String }, // dominant color stored for comparison
    shapeDescriptor: { type: String }, // "round", "oval", "capsule"
    ocrText: { type: String }, // text extracted from strip

    // Relations
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    isActive: { type: Boolean, default: true },
    reminderEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

medicineSchema.index({ patient: 1, isActive: 1 });
medicineSchema.index({ patient: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Medicine', medicineSchema);
