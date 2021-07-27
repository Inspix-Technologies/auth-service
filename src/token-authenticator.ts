import admin from 'firebase-admin';
//TODO: make this secret!
const serviceAccount = require('./firebase-admin.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const tokenAuthenticator = async (token: string) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export default tokenAuthenticator;
