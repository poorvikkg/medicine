const Medicine = require('../models/Medicine');
const MedicineLog = require('../models/MedicineLog');
const { cloudinary } = require('../config/cloudinary');
const { runOCR } = require('../services/ocrService');

// @desc  Add medicine for a patient
// @route POST /api/medicines
// @access Private (doctor, admin)
const addMedicine = async (req, res, next) => {
  try {
    const {
      name, genericName, dosage, dosageUnit, quantity, instructions,
      sideEffects, schedule, startDate, endDate, daysOfWeek,
      patient, shapeDescriptor, colorProfile,
    } = req.body;

    const medicineData = {
      name, genericName, dosage, dosageUnit: dosageUnit || 'tablet',
      quantity: quantity || 1, instructions, sideEffects,
      schedule: typeof schedule === 'string' ? JSON.parse(schedule) : schedule,
      startDate, endDate,
      daysOfWeek: typeof daysOfWeek === 'string' ? JSON.parse(daysOfWeek) : daysOfWeek,
      patient, addedBy: req.user._id,
      shapeDescriptor, colorProfile,
    };

    if (req.file) {
      medicineData.medicineImage = req.file.path;
      medicineData.medicineImagePublicId = req.file.filename;
      // Run OCR on uploaded image
      try {
        const ocrText = await runOCR(req.file.path);
        medicineData.ocrText = ocrText;
      } catch (_) {}
    }

    const medicine = await Medicine.create(medicineData);

    // Generate today's log entries immediately so they show on the dashboard
    // without waiting for the midnight scheduler
    try {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const parsedSchedule = medicineData.schedule || [];
      const parsedDays = medicineData.daysOfWeek || [];
      const medStartDate = new Date(medicineData.startDate);
      medStartDate.setHours(0, 0, 0, 0);

      // Only generate logs if today falls within the medicine date range and day-of-week filter
      const todayStart = new Date(today);
      todayStart.setHours(0, 0, 0, 0);
      const withinRange = medStartDate <= todayStart && (!medicineData.endDate || new Date(medicineData.endDate) >= todayStart);
      const dayAllowed = !parsedDays.length || parsedDays.includes(dayOfWeek);

      if (withinRange && dayAllowed) {
        for (const slot of parsedSchedule) {
          const [hours, minutes] = slot.time.split(':').map(Number);
          const scheduledTime = new Date(today);
          scheduledTime.setHours(hours, minutes, 0, 0);

          // Avoid duplicates
          const exists = await MedicineLog.findOne({
            medicine: medicine._id,
            patient: medicine.patient,
            scheduledTime,
          });
          if (!exists) {
            await MedicineLog.create({
              patient: medicine.patient,
              medicine: medicine._id,
              scheduledTime,
              status: 'pending',
            });
          }
        }
      }
    } catch (logErr) {
      // Log generation failure should not block the medicine creation response
      console.error('[addMedicine] Failed to generate today\'s logs:', logErr.message);
    }

    res.status(201).json({ success: true, medicine });
  } catch (err) {
    next(err);
  }
};

// @desc  Get all medicines for a patient
// @route GET /api/medicines/patient/:patientId
// @access Private
const getPatientMedicines = async (req, res, next) => {
  try {
    const patientId = req.params.patientId || req.user._id;
    const medicines = await Medicine.find({ patient: patientId, isActive: true })
      .populate('addedBy', 'name role')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: medicines.length, medicines });
  } catch (err) {
    next(err);
  }
};

// @desc  Get single medicine
// @route GET /api/medicines/:id
// @access Private
const getMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id)
      .populate('patient', 'name email')
      .populate('addedBy', 'name role');
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.json({ success: true, medicine });
  } catch (err) {
    next(err);
  }
};

// @desc  Update medicine
// @route PUT /api/medicines/:id
// @access Private (doctor, admin)
const updateMedicine = async (req, res, next) => {
  try {
    let medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });

    const updates = { ...req.body };
    if (req.body.schedule && typeof req.body.schedule === 'string')
      updates.schedule = JSON.parse(req.body.schedule);
    if (req.body.daysOfWeek && typeof req.body.daysOfWeek === 'string')
      updates.daysOfWeek = JSON.parse(req.body.daysOfWeek);

    if (req.file) {
      // Delete old image
      if (medicine.medicineImagePublicId)
        await cloudinary.uploader.destroy(medicine.medicineImagePublicId);
      updates.medicineImage = req.file.path;
      updates.medicineImagePublicId = req.file.filename;
      try {
        updates.ocrText = await runOCR(req.file.path);
      } catch (_) {}
    }

    medicine = await Medicine.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.json({ success: true, medicine });
  } catch (err) {
    next(err);
  }
};

// @desc  Delete (soft) medicine
// @route DELETE /api/medicines/:id
// @access Private (doctor, admin)
const deleteMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id, { isActive: false }, { new: true }
    );
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.json({ success: true, message: 'Medicine removed' });
  } catch (err) {
    next(err);
  }
};

// @desc  Get today's medicines for a patient
// @route GET /api/medicines/today/:patientId
// @access Private
const getTodayMedicines = async (req, res, next) => {
  try {
    const patientId = req.params.patientId || req.user._id;
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const logs = await MedicineLog.find({
      patient: patientId,
      scheduledTime: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate('medicine', 'name dosage medicineImage instructions schedule shapeDescriptor')
      .sort({ scheduledTime: 1 });

    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    next(err);
  }
};

module.exports = { addMedicine, getPatientMedicines, getMedicine, updateMedicine, deleteMedicine, getTodayMedicines };
