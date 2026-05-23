import axios from 'axios';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../configs/firebase';
import { getDoc, setDoc } from 'firebase/firestore';
import { idGenerator } from '../../utils/idGenerator';
import { createInitialProgress } from '../services/createInitialProgress';
import { userDataRef, userProgressRef } from '../refs/userRefs';

// * Interface contendo as propriedades utilizadas da response oauth do Google.
export interface OAuthUserPayload {
	uid: string;
	name: string;
	email: string;
	picture: string;
}

export const signInWithGoogle = async () => {
	const credential = await signInWithPopup(auth, googleProvider);
	const idToken = await credential.user.getIdToken();
	const res = await axios.post<OAuthUserPayload>(
		`${import.meta.env.VITE_API_URL}/auth/oauth/google`,
		null,
		{
			headers: {
				Authorization: `Bearer ${idToken}`,
			},
		},
	);

	const { name, email, picture, uid } = res.data;

	const userDoc = await getDoc(userDataRef(uid));
	const initialProgressData = await createInitialProgress(uid);

	if (userDoc.exists()) {
		const progressDoc = await getDoc(userProgressRef(uid));

		return {
			uid,
			providerData: userDoc.data(),
			progressData: progressDoc.exists()
				? progressDoc.data()
				: initialProgressData,
		};
	}

	await setDoc(userDataRef(uid), {
		id: idGenerator().generateID(),
		name,
		email,
		picture,
		lastname: null,
		birthDate: null,
		savedTips: [],
	});

	return {
		uid,
		providerData: { name, email, picture, uid },
		progressData: initialProgressData,
	};
};

export const signupWithGitHub = async () => {};
