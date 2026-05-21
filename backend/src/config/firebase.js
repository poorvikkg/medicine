const admin = require('firebase-admin');

let firebaseInitialized = false;

const initFirebase = () => {
  if (firebaseInitialized) return;
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    firebaseInitialized = true;
    console.log('Firebase Admin initialized');
  } catch (err) {
    console.error('Firebase init error:', err.message);
  }
};

const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  initFirebase();
  if (!fcmToken) return;
  try {
    const message = {
      token: fcmToken,
      notification: { title, body },
      data: { ...data },
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default', badge: 1 } } },
    };
    const response = await admin.messaging().send(message);
    return response;
  } catch (error) {
    console.error('FCM send error:', error.message);
  }
};

const sendMulticastNotification = async (tokens, title, body, data = {}) => {
  initFirebase();
  if (!tokens?.length) return;
  try {
    const message = {
      tokens,
      notification: { title, body },
      data: { ...data },
      android: { priority: 'high' },
    };
    return await admin.messaging().sendEachForMulticast(message);
  } catch (error) {
    console.error('FCM multicast error:', error.message);
  }
};

module.exports = { sendPushNotification, sendMulticastNotification };
