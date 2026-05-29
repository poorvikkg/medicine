const cron = require('node-cron');
const Medicine = require('../models/Medicine');
const MedicineLog = require('../models/MedicineLog');
const Notification = require('../models/Notification');
const FamilyAlert = require('../models/FamilyAlert');
const User = require('../models/User');
const { sendPushNotification } = require('../config/firebase');
const { sendEmail } = require('../config/email');

/**
 * Generate MedicineLog entries for today's schedules.
 * Runs once daily at midnight.
 */
const generateDailyLogs = async () => {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfDay = new Date(today); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today); endOfDay.setHours(23, 59, 59, 999);

    const medicines = await Medicine.find({
      isActive: true,
      startDate: { $lte: endOfDay },
      $or: [{ endDate: null }, { endDate: { $gte: startOfDay } }],
    });

    for (const med of medicines) {
      // Check day-of-week restriction
      if (med.daysOfWeek?.length && !med.daysOfWeek.includes(dayOfWeek)) continue;

      for (const slot of med.schedule) {
        const [hours, minutes] = slot.time.split(':').map(Number);
        const scheduledTime = new Date(today);
        scheduledTime.setHours(hours, minutes, 0, 0);

        // Avoid duplicates
        const exists = await MedicineLog.findOne({
          medicine: med._id,
          patient: med.patient,
          scheduledTime,
        });
        if (!exists) {
          await MedicineLog.create({
            patient: med.patient,
            medicine: med._id,
            scheduledTime,
            status: 'pending',
          });
        }
      }
    }
    console.log(`[Scheduler] Daily logs generated for ${today.toDateString()}`);
  } catch (err) {
    console.error('[Scheduler] Error generating daily logs:', err.message);
  }
};

/**
 * Send push notifications for upcoming medicines (15 min before).
 * Runs every 5 minutes.
 */
const sendUpcomingReminders = async () => {
  try {
    const now = new Date();
    const soon = new Date(now.getTime() + 15 * 60 * 1000); // 15 min window

    const pendingLogs = await MedicineLog.find({
      status: 'pending',
      scheduledTime: { $gte: now, $lte: soon },
    }).populate('medicine', 'name dosage medicineImage instructions').populate('patient', 'fcmToken name');

    for (const log of pendingLogs) {
      const { patient, medicine } = log;
      if (!patient?.fcmToken) continue;

      const title = `Time for ${medicine.name}`;
      const body = `Dosage: ${medicine.dosage}. ${medicine.instructions || ''}`.trim();

      await sendPushNotification(patient.fcmToken, title, body, {
        logId: log._id.toString(),
        medicineId: medicine._id.toString(),
        medicineImage: medicine.medicineImage || '',
        type: 'reminder',
      });

      // Save in-app notification
      await Notification.create({
        user: patient._id,
        title,
        body,
        type: 'reminder',
        relatedMedicine: medicine._id,
        relatedLog: log._id,
        deliveredViaFCM: true,
      });
    }
  } catch (err) {
    console.error('[Scheduler] Reminder error:', err.message);
  }
};

/**
 * Mark overdue pending logs as missed and send family alerts.
 * Runs every 30 minutes.
 */
const markMissedAndAlert = async () => {
  try {
    const cutoff = new Date(Date.now() - 30 * 60 * 1000); // 30 min overdue

    const overdue = await MedicineLog.find({
      status: 'pending',
      scheduledTime: { $lte: cutoff },
    }).populate('medicine', 'name').populate({
      path: 'patient',
      select: 'name caregivers fcmToken',
      populate: { path: 'caregivers', select: 'fcmToken name email' },
    });

    for (const log of overdue) {
      log.status = 'missed';
      log.missedAlertSent = true;
      await log.save();

      // Count consecutive misses in last 24h
      const recentMisses = await MedicineLog.countDocuments({
        patient: log.patient._id,
        medicine: log.medicine._id,
        status: 'missed',
        scheduledTime: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      });

      // Notify patient
      if (log.patient?.fcmToken) {
        await sendPushNotification(
          log.patient.fcmToken,
          'Missed Medicine',
          `You missed ${log.medicine.name}. Please take it if not done.`,
          { type: 'missed', logId: log._id.toString() }
        );
      }

      // Alert caregivers if 2+ misses
      if (recentMisses >= 2 && log.patient?.caregivers?.length) {
        for (const caregiver of log.patient.caregivers) {
          const notifiedVia = [];
          if (caregiver.fcmToken) notifiedVia.push('fcm');

          // Send Email alert if email is available
          if (caregiver.email) {
            try {
              const subject = `Medicare Alert: ${log.patient.name} missed their medicine`;
              const text = `Dear ${caregiver.name},\n\nThis is an alert from MediCare. Patient ${log.patient.name} has missed their medicine "${log.medicine.name}" ${recentMisses} time(s) today. Please check on them as soon as possible.\n\nBest regards,\nMediCare Team`;
              const html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 3px solid #000000; border-radius: 6px;">
                  <h2 style="color: #000000; border-bottom: 3px solid #000000; padding-bottom: 10px;">Medicare Alert</h2>
                  <p>Dear <strong>${caregiver.name}</strong>,</p>
                  <p>This is an automated alert regarding <strong>${log.patient.name}</strong>.</p>
                  <div style="background-color: #f9f9f9; padding: 15px; border-left: 5px solid #d9534f; margin: 15px 0;">
                    <p style="margin: 0; font-size: 16px;"><strong>Status:</strong> Missed Medication</p>
                    <p style="margin: 5px 0 0 0; font-size: 16px;"><strong>Medicine:</strong> ${log.medicine.name}</p>
                    <p style="margin: 5px 0 0 0; font-size: 16px;"><strong>Missed Count Today:</strong> ${recentMisses}</p>
                  </div>
                  <p>Please contact or check on <strong>${log.patient.name}</strong> to ensure they take their required dosage.</p>
                  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                  <p style="font-size: 12px; color: #777;">This is an automated email from MediCare. Please do not reply directly to this message.</p>
                </div>
              `;
              await sendEmail({ to: caregiver.email, subject, text, html });
              notifiedVia.push('email');
            } catch (err) {
              console.error(`[Scheduler] Failed to send email alert to ${caregiver.email}:`, err.message);
            }
          }

          await FamilyAlert.create({
            patient: log.patient._id,
            caregiver: caregiver._id,
            alertType: recentMisses >= 3 ? 'repeated_miss' : 'missed_dose',
            missCount: recentMisses,
            relatedMedicine: log.medicine._id,
            message: `${log.patient.name} has missed ${log.medicine.name} ${recentMisses} time(s) today.`,
            notifiedVia,
          });

          if (caregiver.fcmToken) {
            await sendPushNotification(
              caregiver.fcmToken,
              'Family Alert',
              `${log.patient.name} missed ${log.medicine.name} (${recentMisses}x today)`,
              { type: 'family_alert', patientId: log.patient._id.toString() }
            );
          }
        }
      }
    }
  } catch (err) {
    console.error('[Scheduler] Miss/Alert error:', err.message);
  }
};

/**
 * Start all cron jobs.
 */
const startScheduler = () => {
  // Generate logs at midnight every day
  cron.schedule('0 0 * * *', generateDailyLogs, { timezone: 'Asia/Kolkata' });

  // Send reminders every 5 minutes
  cron.schedule('*/5 * * * *', sendUpcomingReminders);

  // Mark missed & send alerts every 30 minutes
  cron.schedule('*/30 * * * *', markMissedAndAlert);

  // Run immediately on startup for today's logs
  generateDailyLogs();

  console.log('[Scheduler] All cron jobs started');
};

module.exports = { startScheduler, generateDailyLogs, sendUpcomingReminders, markMissedAndAlert };
