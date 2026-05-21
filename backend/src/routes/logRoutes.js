const express = require('express');
const router = express.Router();
const { markAsTaken, verifyMedicine, getLogs, snoozelog } = require('../controllers/logController');
const { protect } = require('../middleware/auth');
const { uploadVerification } = require('../config/cloudinary');

router.use(protect);

router.get('/', getLogs);
router.put('/:logId/take', markAsTaken);
router.put('/:logId/snooze', snoozelog);
router.post('/:logId/verify', uploadVerification.single('verificationImage'), verifyMedicine);

module.exports = router;
