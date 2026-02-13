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
import { auth, db, googleProvider } from '../database/firebase';
import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { idGenerator } from '../utils/idGenerator';
import { createInitialProgress } from '../utils/createInitialProgress';

export const signUpWithCredentials = async (userData) => {
	const { password, ...persistedData } = userData;
	const credential = await createUserWithEmailAndPassword(
		auth,
		persistedData.email,
		password,
	);
	const idToken = await credential.user.getIdToken();
	const res = await axios.post(
		`${import.meta.env.VITE_API_URL}/auth/verify-token`,
		null,
		{
			headers: {
				Authorization: `Bearer ${idToken}`,
			},
		},
	);
	const { uid } = res.data;
	const id = idGenerator().generateID();

	await setDoc(doc(db, 'users', uid), { ...persistedData, id });

	const progressData = await createInitialProgress(uid);

	return { uid, persistedData, progressData };
};

export const signInWithCredentials = async (email, password) => {
	const { user } = await signInWithEmailAndPassword(auth, email, password);
	const idToken = await user.getIdToken();
	const res = await axios.post(
		`${import.meta.env.VITE_API_URL}/auth/verify-token`,
		null,
		{
			headers: {
				Authorization: `Bearer ${idToken}`,
			},
		},
	);

	const { uid } = res.data;
	const userDoc = await getDoc(doc(db, 'users', uid));
	const progressDoc = await getDoc(doc(db, 'userProgress', uid));

	if (!userDoc.exists() || !progressDoc.exists()) {
		throw new Error('Erro na requisição dos dados para esse usuário');
	}

	return { uid, userData: userDoc.data(), progressData: progressDoc.data() };
};

export const deleteAccount = async (password, uid) => {
	try {
		const { providerId } = auth.currentUser.providerData[0];
		switch (providerId) {
			case ProviderId.PASSWORD: {
				const credential = EmailAuthProvider.credential(
					auth.currentUser.email,
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
			deleteDoc(doc(db, 'users', uid)),
			deleteDoc(doc(db, 'userProgress', uid)),
			deleteUser(auth.currentUser),
		]);
		return { success: true };
	} catch (error) {
		return { success: false, error };
	}
};
