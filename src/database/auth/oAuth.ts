import { signInWithPopup, type AuthProvider } from 'firebase/auth';
import { auth, db } from '../configs/firebase';
import { getDoc, writeBatch } from 'firebase/firestore';
import { idGenerator } from '../../utils/idGenerator';
import {
	userDataRef,
	userNavigationRef,
	userProgressRef,
} from '../refs/userRefs';
import { getNavigationStorage } from '../../services/storage/navigationStorage';
import { getProgressStorage } from '../../services/storage/progressStorage';
import { isProgressInitialized } from '../../utils/progress';
import { fetchInitialContent } from '../../content/services/fetchInitialContent';
import type { ModuleData } from '../../types/content';
import { DisplayableError } from '../../classes/DisplayableError';

type SignInWithProviderProps = {
	modules: ModuleData[] | null;
	provider: AuthProvider;
};

export const signInWithProvider = async ({
	modules,
	provider,
}: SignInWithProviderProps) => {
	const credential = await signInWithPopup(auth, provider);

	const { displayName, email, photoURL, uid } = credential.user;

	if (!email) {
		throw new DisplayableError(
			'Não foi possível obter o e-mail da conta selecionada. Verifique as configurações da sua conta Google ou fale conosco.',
		);
	}

	const userDoc = await getDoc(userDataRef(uid));

	if (userDoc.exists()) {
		const [progressDoc, navigationDoc] = await Promise.all([
			getDoc(userProgressRef(uid)),
			getDoc(userNavigationRef(uid)),
		]);

		if (!progressDoc.exists() || !navigationDoc.exists()) {
			throw new DisplayableError(
				'Não foi possível acessar sua conta no momento. Entre em contato conosco para regularizar a situação.',
			);
		}

		return {
			userData: userDoc.data(),
			progressData: progressDoc.data(),
			navigationData: navigationDoc.data(),
		};
	}

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

	const userData = {
		id: 'TPY-' + idGenerator().generateId(),
		name: displayName || 'Aluno',
		email: email,
		picture: photoURL,
		lastname: null,
		birthDate: null,
		createdAt: new Date(),
		supporter: false,
		resolutions: [],
	};

	const batch = writeBatch(db);
	batch.set(userDataRef(uid), userData);
	batch.set(userProgressRef(uid), finalProgress);
	batch.set(userNavigationRef(uid), initialNavigationState);
	await batch.commit();

	return {
		userData,
		progressData: finalProgress,
		navigationData: initialNavigationState,
	};
};
