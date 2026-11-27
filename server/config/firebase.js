import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

let authInstance = null;

async function initFirebaseAuth() {
  if (authInstance) return authInstance;

  try {
    const { getApps, initializeApp, cert } = await import('firebase-admin/app');
    const { getAuth } = await import('firebase-admin/auth');

    const existingApps = getApps();
    let app;

    if (existingApps.length > 0) {
      app = existingApps[0];
    } else {
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        app = initializeApp({
          credential: cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id || 'nilaviee'
        });
      } else if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        app = initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID || 'nilaviee',
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
          }),
          projectId: process.env.FIREBASE_PROJECT_ID || 'nilaviee'
        });
      } else {
        app = initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID || 'nilaviee'
        });
      }
    }

    authInstance = getAuth(app);
    return authInstance;
  } catch (error) {
    console.error('⚠️ Firebase Admin initialization notice:', error.message);
    return null;
  }
}

/**
 * Cryptographically verifies a Firebase ID token.
 * Prevents spoofing, tampering, and expired sessions.
 * @param {string} idToken
 */
export async function verifyFirebaseIdToken(idToken) {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('Missing or invalid token format');
  }
  const auth = await initFirebaseAuth();
  if (!auth) {
    throw new Error('Firebase Auth not available');
  }
  return await auth.verifyIdToken(idToken.trim());
}

export default { verifyFirebaseIdToken };
