const express = require('express');
const router = express.Router();
const {
  getNotifications, markRead, getFamilyAlerts, resolveAlert,
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getNotifications);
router.put('/read', markRead);
router.get('/family-alerts', authorize('caregiver', 'doctor', 'admin'), getFamilyAlerts);
router.put('/family-alerts/:alertId/resolve', resolveAlert);

module.exports = router;
