const MedicineLog = require('../models/MedicineLog');
const FamilyAlert = require('../models/FamilyAlert');
const User = require('../models/User');

// @desc  Get dashboard summary for a patient
// @route GET /api/dashboard/:patientId
// @access Private
const getDashboard = async (req, res, next) => {
  try {
    const patientId = req.params.patientId || req.user._id;
    const today = new Date();
    const startOfDay = new Date(today); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today); endOfDay.setHours(23, 59, 59, 999);

    const [upcoming, completed, missed, recentAlerts] = await Promise.all([
      // Use startOfDay (not now) so doses scheduled for earlier today still appear if not yet taken
      MedicineLog.find({ patient: patientId, status: { $in: ['pending', 'snoozed'] }, scheduledTime: { $gte: startOfDay, $lte: endOfDay } })
        .populate('medicine', 'name dosage medicineImage instructions dosageUnit')
        .sort({ scheduledTime: 1 }).limit(20),
      MedicineLog.find({ patient: patientId, status: 'taken', scheduledTime: { $gte: startOfDay, $lte: endOfDay } })
        .populate('medicine', 'name dosage medicineImage dosageUnit').sort({ takenTime: -1 }).limit(20),
      MedicineLog.find({ patient: patientId, status: 'missed', scheduledTime: { $gte: startOfDay, $lte: endOfDay } })
        .populate('medicine', 'name dosage medicineImage dosageUnit').sort({ scheduledTime: -1 }),
      FamilyAlert.find({ patient: patientId, resolved: false }).sort({ createdAt: -1 }).limit(5),
    ]);

    res.json({ success: true, dashboard: { upcoming, completed, missed, recentAlerts } });
  } catch (err) {
    next(err);
  }
};

// @desc  Get analytics for a patient
// @route GET /api/analytics/:patientId
// @access Private
const getAnalytics = async (req, res, next) => {
  try {
    const patientId = req.params.patientId || req.user._id;
    const { days = 7 } = req.query;
    const from = new Date();
    from.setDate(from.getDate() - Number(days));

    const logs = await MedicineLog.find({
      patient: patientId,
      scheduledTime: { $gte: from },
      status: { $in: ['taken', 'missed'] },
    }).select('status scheduledTime medicine').populate('medicine', 'name');

    const total = logs.length;
    const taken = logs.filter((l) => l.status === 'taken').length;
    const missed = total - taken;
    const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;

    // Daily breakdown
    const dailyMap = {};
    logs.forEach((log) => {
      const day = log.scheduledTime.toISOString().split('T')[0];
      if (!dailyMap[day]) dailyMap[day] = { taken: 0, missed: 0 };
      dailyMap[day][log.status]++;
    });

    // Per-medicine adherence
    const medicineMap = {};
    logs.forEach((log) => {
      const name = log.medicine?.name || 'Unknown';
      if (!medicineMap[name]) medicineMap[name] = { taken: 0, missed: 0 };
      medicineMap[name][log.status]++;
    });

    res.json({
      success: true,
      analytics: {
        total, taken, missed, adherence,
        dailyBreakdown: dailyMap,
        perMedicine: medicineMap,
        period: `Last ${days} days`,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard, getAnalytics };
