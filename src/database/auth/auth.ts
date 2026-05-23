import axios from 'axios';
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	deleteUser,
	reauthenticateWithCredential,
	ProviderId,
	EmailAuthProvider,
	reauthenticateWithPopup,
	getIdTokenResult,
} from 'firebase/auth';
import { auth, googleProvider } from '../configs/firebase';
import { deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { createInitialProgress } from '../services/createInitialProgress';
import type { UserData } from '../../types/user';
import { userDataRef, userProgressRef } from '../refs/userRefs';

type SignUpType = UserData & { password: string };

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

	const progressData = await createInitialProgress(uid);

	return { uid, persistedData, progressData };
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

	if (!userDoc.exists() || !progressDoc.exists()) {
		throw new Error('Erro na requisição dos dados para esse usuário.');
	}

	return { uid, userData: userDoc.data(), progressData: progressDoc.data() };
};

export const deleteAccount = async (password: string, uid: string) => {
	if (!auth.currentUser)
		throw new Error('Sessão expirada. Faça login e tente novamente.');

	try {
		const { signInProvider } = await getIdTokenResult(auth.currentUser);

		switch (signInProvider) {
			case ProviderId.PASSWORD: {
				const credential = EmailAuthProvider.credential(
					auth.currentUser.email!,
					password,
				);
				await reauthenticateWithCredential(auth.currentUser, credential);
				break;
			}
			case ProviderId.GOOGLE: {
				await reauthenticateWithPopup(auth.currentUser, googleProvider);
				break;
			}
			case ProviderId.GITHUB: {
				break;
			}
		}
		await Promise.all([
			deleteDoc(userDataRef(uid)),
			deleteDoc(userProgressRef(uid)),
			deleteUser(auth.currentUser),
		]);
		return { success: true };
	} catch (error) {
		return { success: false, error };
	}
};
