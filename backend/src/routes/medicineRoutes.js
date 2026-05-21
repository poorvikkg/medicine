const express = require('express');
const router = express.Router();
const {
  addMedicine, getPatientMedicines, getMedicine,
  updateMedicine, deleteMedicine, getTodayMedicines,
} = require('../controllers/medicineController');
const { protect, authorize } = require('../middleware/auth');
const { uploadMedicine } = require('../config/cloudinary');

router.use(protect);

router.post('/', authorize('doctor', 'admin'), uploadMedicine.single('medicineImage'), addMedicine);
router.get('/patient/:patientId', getPatientMedicines);
router.get('/today/:patientId', getTodayMedicines);
router.get('/:id', getMedicine);
router.put('/:id', authorize('doctor', 'admin'), uploadMedicine.single('medicineImage'), updateMedicine);
router.delete('/:id', authorize('doctor', 'admin'), deleteMedicine);

module.exports = router;
