import axios from 'axios';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../configs/firebase';
import { getDoc, setDoc } from 'firebase/firestore';
import { idGenerator } from '../../utils/idGenerator';
import { userDataRef, userProgressRef } from '../refs/userRefs';
import { fetchInitialProgress } from '../../content/services/fetchInitialProgress';

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
	const initialProgressData = await fetchInitialProgress();

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
		id: 'TPY-' + idGenerator().generateID(),
		name,
		email,
		picture,
		lastname: null,
		birthDate: null,
		savedTips: [],
	});
	await setDoc(userProgressRef(uid), initialProgressData);

	return {
		uid,
		providerData: { name, email, picture, uid },
		progressData: initialProgressData,
	};
};

export const signupWithGitHub = async () => {};
