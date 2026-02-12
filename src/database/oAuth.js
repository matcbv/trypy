import axios from 'axios';
import { signInWithPopup } from 'firebase/auth';
import { auth, db, googleProvider } from '../database/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { idGenerator } from '../utils/idGenerator';
import { createInitialProgress } from '../utils/createInitialProgress';

export const signInWithGoogle = async () => {
	try {
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

		const { name, email, picture, uid } = res.data;

		const userDoc = await getDoc(doc(db, 'users', uid));

		const providerData = userDoc.exists()
			? userDoc.data()
			: { name, email, picture, id: idGenerator().generateID() };

		await setDoc(doc(db, 'users', uid), providerData);

		const progressData = createInitialProgress(uid);

		return {
			success: true,
			data: { uid, providerData, progressData },
		};
	} catch (error) {
		return { success: false, error };
	}
};

export const signupWithGitHub = async () => {};
