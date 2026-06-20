import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  : undefined;

const isConfigured = !!(
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  privateKey
);

let adminDb: Firestore | null = null;
let adminAuth: Auth | null = null;

if (isConfigured) {
  try {
    const apps = getApps();
    const app = apps.length === 0 
      ? initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey,
          }),
        })
      : apps[0];
    
    adminDb = getFirestore(app);
    adminAuth = getAuth(app);
  } catch (error) {
    console.error("Firebase Admin initialization failed:", error);
  }
}

export { adminDb, adminAuth, isConfigured };
export type { Firestore, Auth };
