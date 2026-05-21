const express = require('express');
const router = express.Router();
const { getDashboard, getAnalytics } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/dashboard/:patientId', getDashboard);
router.get('/analytics/:patientId', getAnalytics);

module.exports = router;
