const User = require('../models/User');

// @desc  Get all patients (for doctors, caregivers, admins)
// @route GET /api/users/patients
// @access Private (doctor, caregiver, admin)
const getPatients = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = { role: 'patient' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { medicalId: { $regex: search, $options: 'i' } },
      ];
    }

    const patients = await User.find(query)
      .select('name email phone dateOfBirth medicalId profileImage')
      .sort({ name: 1 });

    res.json({ success: true, count: patients.length, patients });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPatients };
