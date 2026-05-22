const express = require('express');
const router = express.Router();
const { getPatients } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/patients', protect, authorize('doctor', 'caregiver', 'admin'), getPatients);

module.exports = router;
