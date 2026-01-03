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
import { fetchInitialProgress } from '../content/fetchInitialProgress';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { idGenerator } from '../utils/idGenerator';

export const signUpWithCredentials = async (userData) => {
	try {
		const credential = await createUserWithEmailAndPassword(
			auth,
			userData.email,
			userData.password,
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

		await setDoc(doc(db, 'users', uid), { ...userData, id }, { merge: true });

		return {
			success: true,
			data: {
				uid,
				initialProgress: await fetchInitialProgress(),
			},
		};
	} catch (error) {
		return { success: false, error };
	}
};

export const signInWithCredentials = async (email, password) => {
	try {
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

		return {
			success: true,
			uid,
			userData: userDoc.data(),
			progressData: progressDoc.data(),
		};
	} catch (error) {
		return { success: false, error };
	}
};

export const deleteAccount = async (password) => {
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
		await deleteUser(auth.currentUser);
		return { success: true };
	} catch (error) {
		return { success: false, error };
	}
};
