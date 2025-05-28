import path from 'path';
import fs from 'fs';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const credPath = path.resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS || '');

if (!fs.existsSync(credPath)) {
  throw new Error(`Firebase service account not found at ${credPath}`);
}

const serviceAccount = require(credPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID,
});

const db = admin.firestore();

export default db;
