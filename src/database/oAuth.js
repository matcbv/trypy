import axios from 'axios';
import { signInWithPopup } from 'firebase/auth';
import { auth, db, googleProvider } from '../database/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { fetchInitialProgress } from '../content/fetchInitialProgress';
import { idGenerator } from '../utils/idGenerator';

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

		const { uid } = res.data;

		const userDoc = await getDoc(doc(db, 'users', uid));

		let providerData;
		if (userDoc.exists()) {
			providerData = userDoc.data();
		} else {
			const { name, email, picture } = res.data;
			providerData = { name, email, picture, id: idGenerator().generateID() };
		}

		const progressDoc = await getDoc(doc(db, 'userProgress', uid));
		const progressData = progressDoc.exists()
			? progressDoc.data()
			: await fetchInitialProgress();

		return {
			success: true,
			data: {
				uid,
				providerData,
				progressData,
			},
		};
	} catch (error) {
		return { success: false, error };
	}
};

export const signupWithGitHub = async () => {};
