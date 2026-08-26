const admin = require('firebase-admin');

exports.handler = async (event) => {
  // التأكد من أن الطلب من نوع POST فقط
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: 'Method Not Allowed' }) 
    };
  }

  try {
    // تهيئة تطبيق الفايربيس إذا لم يكن مهيئاً من قبل
    if (!admin.apps.length) {
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      if (privateKey) {
        // معالجة السطور الجديدة في المفتاح الخاص
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

    // قراءة البيانات المرسلة من صفحة notifications.html
    const { token, title, body, customerId } = JSON.parse(event.body || '{}');

    if (!token || !title || !body) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ success: false, error: 'البيانات غير مكتملة' })
      };
    }

    // تجهيز هيكل الإشعار المرسل لـ Google FCM V1
    const message = {
      token: token,
      notification: { 
        title: title, 
        body: body 
      },
      webpush: {
        fcmOptions: {
          link: customerId ? `/index.html?${customerId}` : '/'
        }
      }
    };

    // إرسال الإشعار عبر Firebase Admin SDK
    const response = await admin.messaging().send(message);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, messageId: response })
    };

  } catch (error) {
    // إرجاع تفاصيل الخطأ بوضوح في حال حدوث أي استثناء
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, error: error.message || 'حدث خطأ في الخادم' })
    };
  }
};
