const express = require('express');
const router = express.Router();
const { 
  generateDailyLogs, 
  sendUpcomingReminders, 
  markMissedAndAlert 
} = require('../services/reminderScheduler');

// GET /api/cron/trigger
// Secure it optionally with a CRON_SECRET token
router.get('/trigger', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    console.log('[Cron Webhook] Triggering scheduled tasks...');
    
    // Execute all cron tasks
    await Promise.all([
      generateDailyLogs(),
      sendUpcomingReminders(),
      markMissedAndAlert()
    ]);

    res.json({
      success: true,
      message: 'All cron tasks executed successfully',
      timestamp: new Date()
    });
  } catch (err) {
    console.error('[Cron Webhook] Error executing cron tasks:', err.message);
    next(err);
  }
});

module.exports = router;
