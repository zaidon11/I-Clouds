const admin = require('firebase-admin');

if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY 
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
    : undefined;

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey
    })
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { token, title, body, customerId } = JSON.parse(event.body);

    if (!token || !title || !body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'البيانات غير مكتملة' })
      };
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

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, messageId: response })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
