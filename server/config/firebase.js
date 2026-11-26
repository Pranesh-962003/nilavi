import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

let firebaseApp;

try {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    firebaseApp = existingApps[0];
  } else {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      firebaseApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id || 'nilaviee'
      });
      console.log('🛡️ Firebase Admin initialized with service account key file.');
    } else if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      firebaseApp = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID || 'nilaviee',
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        }),
        projectId: process.env.FIREBASE_PROJECT_ID || 'nilaviee'
      });
      console.log('🛡️ Firebase Admin initialized with environment credentials.');
    } else {
      firebaseApp = initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'nilaviee'
      });
      console.log('🛡️ Firebase Admin initialized with project ID verification.');
    }
  }
} catch (error) {
  console.error('⚠️ Firebase Admin initialization error:', error.message);
  const existingApps = getApps();
  if (existingApps.length > 0) {
    firebaseApp = existingApps[0];
  }
}

export const firebaseAuth = getAuth(firebaseApp);

/**
 * Cryptographically verifies a Firebase ID token.
 * Prevents spoofing, tampering, and expired sessions.
 * @param {string} idToken
 * @returns {Promise<import('firebase-admin/auth').DecodedIdToken>}
 */
export async function verifyFirebaseIdToken(idToken) {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('Missing or invalid token format');
  }
  return await firebaseAuth.verifyIdToken(idToken.trim());
}

export default firebaseApp;
