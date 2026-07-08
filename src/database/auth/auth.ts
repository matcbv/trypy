import axios from 'axios';
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
} from 'firebase/auth';
import { auth } from '../configs/firebase';
import { getDoc, setDoc } from 'firebase/firestore';
import type { UserData, UserNavigation } from '../../types/user';
import {
	userDataRef,
	userNavigationRef,
	userProgressRef,
} from '../refs/userRefs';
import { fetchInitialProgress } from '../../content/services/fetchInitialProgress';
import {
	getNavigationStorage,
	removeNavigationSorage,
} from '../../services/navigationStorage';
import {
	getProgressStorage,
	removeProgressSorage,
} from '../../services/progressStorage';
import progressInitialState from '../../contexts/ProgressProvider/initialState';
import authActionTypes from '../../contexts/AuthProvider/actionTypes';
import navigationInitialState from '../../contexts/NavigationProvider/initialState';
import type {
	AuthContextType,
	NavigationContextType,
	ProgressContextType,
} from '../../types/contexts';
import { logError } from '../../utils/logger';

type SignUpType = UserData & { password: string };

interface LogoutProps {
	authDispatch: AuthContextType['authDispatch'];
	setProgressState: ProgressContextType['setProgressState'];
	setNavigationState: NavigationContextType['setNavigationState'];
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

	const progressStorage = getProgressStorage();
	const initialProgressData = progressStorage || (await fetchInitialProgress());
	const navigationStorage = getNavigationStorage();
	const initialNavigationState: UserNavigation =
		Object.keys(navigationStorage).length > 0
			? navigationStorage
			: {
					1: {
						currentTopic: initialProgressData.inProgressTopic,
						currentSubtopic: initialProgressData.inProgressSubtopic,
					},
				};

	await setDoc(userDataRef(uid), persistedData);
	await setDoc(userProgressRef(uid), initialProgressData);
	await setDoc(userNavigationRef(uid), initialNavigationState);

	return {
		uid,
		userData: persistedData,
		progressData: initialProgressData,
		navigationData: initialNavigationState,
	};
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
		logError({
			text: 'Não foi possível realizar o login. Tente novamente ou fale conosco.',
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

export const logout = async ({
	authDispatch,
	setProgressState,
	setNavigationState,
}: LogoutProps) => {
	await signOut(auth);
	authDispatch({ type: authActionTypes.LOGOUT });
	setProgressState(progressInitialState);
	setNavigationState(navigationInitialState);
	removeNavigationSorage();
	removeProgressSorage();
};
