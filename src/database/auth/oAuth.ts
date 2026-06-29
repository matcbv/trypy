import axios from 'axios';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../configs/firebase';
import { getDoc, setDoc } from 'firebase/firestore';
import { idGenerator } from '../../utils/idGenerator';
import {
	userDataRef,
	userNavigationRef,
	userProgressRef,
} from '../refs/userRefs';
import { fetchInitialProgress } from '../../content/services/fetchInitialProgress';
import type { ToastData } from '../../types/toast';
import { toast } from 'react-toastify';
import { ToastNotification } from '../../components/Notifications';
import type { UserNavigation } from '../../types/user';

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

	if (userDoc.exists()) {
		const progressDoc = await getDoc(userProgressRef(uid));
		const navigationDoc = await getDoc(userNavigationRef(uid));

		if (!progressDoc.exists() || !navigationDoc.exists()) {
			toast<ToastData>(ToastNotification, {
				type: 'error',
				data: {
					type: 'error',
					text: 'Não foi possível realizar o login. Tente novamente ou fale conosco.',
				},
			});
			throw new Error('Erro na requisição dos dados do usuário.');
		}

		return {
			uid,
			providerData: userDoc.data(),
			progressData: progressDoc.data(),
			navigationData: navigationDoc.data(),
		};
	}

	await setDoc(userDataRef(uid), {
		id: 'TPY-' + idGenerator().generateID(),
		name,
		email,
		picture,
		lastname: null,
		birthDate: null,
		createdAt: new Date(),
		supporter: false,
		savedTips: [],
		resolutions: {},
	});

	const initialProgressData = await fetchInitialProgress();
	await setDoc(userProgressRef(uid), initialProgressData);

	const initialNavigationState: UserNavigation = {
		1: {
			currentTopic: initialProgressData.inProgressTopic,
			currentSubtopic: initialProgressData.inProgressSubtopic,
		},
	};

	await setDoc(userNavigationRef(uid), initialNavigationState);

	return {
		uid,
		providerData: { name, email, picture, uid },
		progressData: initialProgressData,
		navigationData: initialNavigationState,
	};
};

export const signupWithGitHub = async () => {};
