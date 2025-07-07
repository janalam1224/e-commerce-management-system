import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const credPath = path.resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS || '');
if (!fs.existsSync(credPath)) {
  throw new Error(`Firebase service account not found at ${credPath}`);
}

const serviceAccount = require(credPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

export { db, bucket };
