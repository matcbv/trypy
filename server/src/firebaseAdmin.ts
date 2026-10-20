import dotenv from 'dotenv';
dotenv.config({ path: 'server/.env' });

import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const app = initializeApp({
	credential: applicationDefault(),
	storageBucket: 'trypy-website.firebasestorage.app',
});

const adminAuth = getAuth(app);
const adminDb = getFirestore(app);
const storage = getStorage(app);

export { app, adminAuth, adminDb, storage };
