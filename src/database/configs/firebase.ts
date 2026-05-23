import { initializeApp } from 'firebase/app';
import { getAuth, GithubAuthProvider, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

interface FirebaseConfig {
	apiKey: string;
	authDomain: string;
	projectId: string;
	storageBucket: string;
	messagingSenderId: string;
	appId: string;
}

const firebaseConfig = JSON.parse(
	import.meta.env.VITE_FIREBASE_CONFIG,
) as FirebaseConfig;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

googleProvider.setCustomParameters({
	prompt: 'select_account',
});

githubProvider.setCustomParameters({
	prompt: 'select_account',
});

export { app, auth, db, storage, googleProvider, githubProvider };
