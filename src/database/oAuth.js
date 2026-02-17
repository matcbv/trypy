import axios from 'axios';
import { signInWithPopup } from 'firebase/auth';
import { auth, db, googleProvider } from '../database/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { idGenerator } from '../utils/idGenerator';
import { createInitialProgress } from '../utils/createInitialProgress';

export const signInWithGoogle = async () => {
	const credential = await signInWithPopup(auth, googleProvider);
	const idToken = await credential.user.getIdToken();
	const res = await axios.post(
		`${import.meta.env.VITE_API_URL}/auth/oauth/google`,
		null,
		{
			headers: {
				Authorization: `Bearer ${idToken}`,
			},
		},
	);

	const { uid } = res.data;

	const userDoc = await getDoc(doc(db, 'users', uid));

	if (userDoc.exists()) {
		const progressDoc = await getDoc(doc(db, 'userProgress', uid));
		return {
			uid,
			providerData: userDoc.data(),
			progressData: progressDoc.data(),
		};
	}

	const progressData = await createInitialProgress(uid);

	const { name, email, picture } = res.data;

	await setDoc(doc(db, 'users', uid), {
		name,
		email,
		picture,
		id: idGenerator().generateID(),
	});

	return { uid, providerData: { name, email, picture, uid }, progressData };
};

export const signupWithGitHub = async () => {};
