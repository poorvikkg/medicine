const MedicineLog = require('../models/MedicineLog');
const Medicine = require('../models/Medicine');
const { verifyMedicineImage } = require('../services/aiVerificationService');
const { cloudinary } = require('../config/cloudinary');

// @desc  Mark medicine as taken
// @route PUT /api/logs/:logId/take
// @access Private (patient)
const markAsTaken = async (req, res, next) => {
  try {
    const log = await MedicineLog.findById(req.params.logId);
    if (!log) return res.status(404).json({ success: false, message: 'Log not found' });
    log.status = 'taken';
    log.takenTime = new Date();
    await log.save();
    res.json({ success: true, log });
  } catch (err) {
    next(err);
  }
};

// @desc  Verify medicine via image upload
// @route POST /api/logs/:logId/verify
// @access Private (patient)
const verifyMedicine = async (req, res, next) => {
  try {
    const log = await MedicineLog.findById(req.params.logId).populate('medicine');
    if (!log) return res.status(404).json({ success: false, message: 'Log not found' });

    if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });

    const uploadedImageUrl = req.file.path;
    log.verificationImage = uploadedImageUrl;

    // Run AI verification
    const result = await verifyMedicineImage(log.medicine, uploadedImageUrl);
    log.verificationResult = result;

    if (result.isCorrect) {
      log.status = 'taken';
      log.takenTime = new Date();
    }
    await log.save();

    res.json({
      success: true,
      verificationResult: result,
      message: result.isCorrect
        ? '✅ Correct medicine confirmed!'
        : '⚠️ Medicine mismatch detected. Consult your doctor if unsure.',
      disclaimer: 'This is an AI-assisted check only. Always consult your doctor if unsure.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Get logs for a patient (filtered by date range / status)
// @route GET /api/logs
// @access Private
const getLogs = async (req, res, next) => {
  try {
    const { patientId, status, from, to, limit = 50, page = 1 } = req.query;
    const query = { patient: patientId || req.user._id };
    if (status) query.status = status;
    if (from || to) {
      query.scheduledTime = {};
      if (from) query.scheduledTime.$gte = new Date(from);
      if (to) query.scheduledTime.$lte = new Date(to);
    }
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      MedicineLog.find(query)
        .populate('medicine', 'name dosage medicineImage instructions')
        .sort({ scheduledTime: -1 })
        .skip(skip)
        .limit(Number(limit)),
      MedicineLog.countDocuments(query),
    ]);
    res.json({ success: true, total, page: Number(page), logs });
  } catch (err) {
    next(err);
  }
};

// @desc  Snooze a reminder
// @route PUT /api/logs/:logId/snooze
// @access Private
const snoozelog = async (req, res, next) => {
  try {
    const log = await MedicineLog.findByIdAndUpdate(
      req.params.logId,
      { status: 'snoozed' },
      { new: true }
    );
    if (!log) return res.status(404).json({ success: false, message: 'Log not found' });
    res.json({ success: true, log });
  } catch (err) {
    next(err);
  }
};

module.exports = { markAsTaken, verifyMedicine, getLogs, snoozelog };
