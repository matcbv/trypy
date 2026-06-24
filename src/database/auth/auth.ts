import axios from 'axios';
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	deleteUser,
	reauthenticateWithCredential,
	ProviderId,
	EmailAuthProvider,
	reauthenticateWithPopup,
} from 'firebase/auth';
import { auth, googleProvider } from '../configs/firebase';
import { deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import type { UserData } from '../../types/user';
import {
	userDataRef,
	userNavigationRef,
	userProgressRef,
} from '../refs/userRefs';
import { toast } from 'react-toastify';
import type { ToastData } from '../../types/toast';
import { ToastNotification } from '../../components/Notifications';
import { fetchInitialProgress } from '../../content/services/fetchInitialProgress';

type SignUpType = UserData & { password: string };

type Providers = (typeof ProviderId)[keyof typeof ProviderId];
interface DeleteOptions {
	uid: string;
	provider?: Providers;
	password?: string;
}

export const signUpWithCredentials = async (userData: SignUpType) => {
	const { password, ...persistedData } = userData;
	const credential = await createUserWithEmailAndPassword(
		auth,
		persistedData.email,
		password,
	);
	const idToken = await credential.user.getIdToken();
	const res = await axios.post<{ uid: string }>(
		`${import.meta.env.VITE_API_URL}/auth/verify-token`,
		null,
		{
			headers: {
				Authorization: `Bearer ${idToken}`,
			},
		},
	);
	const { uid } = res.data;

	await setDoc(userDataRef(uid), persistedData);

	const initialProgressData = await fetchInitialProgress();
	await setDoc(userProgressRef(uid), initialProgressData);

	return { uid, persistedData, initialProgressData };
};

export const signInWithCredentials = async (
	email: string,
	password: string,
) => {
	const { user } = await signInWithEmailAndPassword(auth, email, password);
	const idToken = await user.getIdToken();
	const res = await axios.post<{ uid: string }>(
		`${import.meta.env.VITE_API_URL}/auth/verify-token`,
		null,
		{
			headers: {
				Authorization: `Bearer ${idToken}`,
			},
		},
	);

	const { uid } = res.data;
	const userDoc = await getDoc(userDataRef(uid));
	const progressDoc = await getDoc(userProgressRef(uid));
	const navigationDoc = await getDoc(userNavigationRef(uid));

	if (!userDoc.exists() || !progressDoc.exists() || !navigationDoc.exists()) {
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
		userData: userDoc.data(),
		progressData: progressDoc.data(),
		navigationData: navigationDoc.data(),
	};
};

export const deleteAccount = async ({
	uid,
	provider,
	password,
}: DeleteOptions) => {
	if (!auth.currentUser) {
		throw new Error('Sessão expirada. Faça login e tente novamente.');
	}

	try {
		if (provider === ProviderId.PASSWORD) {
			const credential = EmailAuthProvider.credential(
				auth.currentUser.email!,
				password!,
			);
			await reauthenticateWithCredential(auth.currentUser, credential);
		}
		await Promise.all([
			deleteUser(auth.currentUser),
			deleteDoc(userDataRef(uid)),
			deleteDoc(userProgressRef(uid)),
			deleteDoc(userNavigationRef(uid)),
		]);
		return { success: true };
	} catch (error) {
		return { success: false, error };
	}
};
