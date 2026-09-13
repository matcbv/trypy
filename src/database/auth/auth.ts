import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth, db } from '../configs/firebase';
import { getDoc, writeBatch } from 'firebase/firestore';
import type { UserData } from '../../types/user';
import {
	userDataRef,
	userNavigationRef,
	userProgressRef,
} from '../refs/userRefs';
import { getNavigationStorage } from '../../services/navigationStorage';
import { getProgressStorage } from '../../services/progressStorage';
import { isProgressInitialized } from '../../utils/progress';
import { fetchInitialContent } from '../../content/services/fetchInitialContent';
import type { ModuleData } from '../../types/content';
import { DisplayableError } from '../../classes/DisplayableError';

type SignUpType = UserData & { password: string };

interface signUpWithCredentialsProps {
	userData: SignUpType;
	modules: ModuleData[] | null;
}

export const signUpWithCredentials = async ({
	userData,
	modules,
}: signUpWithCredentialsProps) => {
	const { password, ...persistedData } = userData;
	const credential = await createUserWithEmailAndPassword(
		auth,
		persistedData.email,
		password,
	);
	const { uid } = credential.user;

	let finalProgress = getProgressStorage();
	if (!isProgressInitialized(finalProgress)) {
		if (!modules) {
			throw new DisplayableError(
				'Conteúdo inicial ainda não carregado. Tente novamente em instantes.',
			);
		}
		finalProgress = fetchInitialContent(modules);
	}
	const navigationStorage = getNavigationStorage();
	const initialNavigationState = navigationStorage || {
		1: {
			currentTopic: finalProgress.inProgressTopic,
			currentSubtopic: finalProgress.inProgressSubtopic,
		},
	};

	const batch = writeBatch(db);
	batch.set(userDataRef(uid), persistedData);
	batch.set(userProgressRef(uid), finalProgress);
	batch.set(userNavigationRef(uid), initialNavigationState);
	await batch.commit();

	return {
		uid,
		userData: persistedData,
		progressData: finalProgress,
		navigationData: initialNavigationState,
	};
};

export const signInWithCredentials = async (
	email: string,
	password: string,
) => {
	const credential = await signInWithEmailAndPassword(auth, email, password);

	const { uid } = credential.user;

	const [userDoc, progressDoc, navigationDoc] = await Promise.all([
		getDoc(userDataRef(uid)),
		getDoc(userProgressRef(uid)),
		getDoc(userNavigationRef(uid)),
	]);

	if (!userDoc.exists() || !progressDoc.exists() || !navigationDoc.exists()) {
		throw new DisplayableError(
			'Não foi possível acessar sua conta no momento. Entre em contato conosco para regularizar a situação.',
		);
	}

	return {
		uid,
		userData: userDoc.data(),
		progressData: progressDoc.data(),
		navigationData: navigationDoc.data(),
	};
};
