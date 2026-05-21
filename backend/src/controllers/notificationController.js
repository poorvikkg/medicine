const Notification = require('../models/Notification');
const FamilyAlert = require('../models/FamilyAlert');
const User = require('../models/User');
const { sendPushNotification } = require('../config/firebase');

// @desc  Get notifications for logged-in user
// @route GET /api/notifications
// @access Private
const getNotifications = async (req, res, next) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Notification.countDocuments({ user: req.user._id, isRead: false }),
    ]);
    res.json({ success: true, unreadCount, notifications });
  } catch (err) {
    next(err);
  }
};

// @desc  Mark notification(s) as read
// @route PUT /api/notifications/read
// @access Private
const markRead = async (req, res, next) => {
  try {
    const { ids } = req.body; // array of notification IDs, or empty to mark all
    const filter = { user: req.user._id };
    if (ids?.length) filter._id = { $in: ids };
    await Notification.updateMany(filter, { isRead: true });
    res.json({ success: true, message: 'Notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

// @desc  Get family alerts for caregiver
// @route GET /api/notifications/family-alerts
// @access Private (caregiver, doctor, admin)
const getFamilyAlerts = async (req, res, next) => {
  try {
    const alerts = await FamilyAlert.find({ caregiver: req.user._id, resolved: false })
      .populate('patient', 'name phone email')
      .populate('relatedMedicine', 'name dosage medicineImage')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: alerts.length, alerts });
  } catch (err) {
    next(err);
  }
};

// @desc  Resolve a family alert
// @route PUT /api/notifications/family-alerts/:alertId/resolve
// @access Private
const resolveAlert = async (req, res, next) => {
  try {
    const alert = await FamilyAlert.findByIdAndUpdate(
      req.params.alertId,
      { resolved: true, resolvedAt: new Date() },
      { new: true }
    );
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    res.json({ success: true, alert });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications, markRead, getFamilyAlerts, resolveAlert };
