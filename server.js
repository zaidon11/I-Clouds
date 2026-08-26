const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// تهيئة Firebase Admin
if (!admin.apps.length) {
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey
    })
  });
}

// رابط اختبار السيرفر
app.get('/', (req, res) => {
  res.send('مركز الراشد - سيرفر الإشعارات يعمل بنجاح!');
});

// رابط إرسال الإشعار
app.post('/send-notification', async (req, res) => {
  try {
    const { token, title, body, customerId } = req.body;

    if (!token || !title || !body) {
      return res.status(400).json({ success: false, error: 'البيانات غير مكتملة' });
    }

    const message = {
      token: token,
      notification: { title, body },
      webpush: {
        fcmOptions: {
          link: customerId ? `/index.html?${customerId}` : '/'
        }
      }
    };

    const response = await admin.messaging().send(message);
    return res.status(200).json({ success: true, messageId: response });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
