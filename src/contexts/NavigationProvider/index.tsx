import { useEffect, useRef, useState, type ReactNode } from 'react';
import { NavigationContext } from './context';
import { useNavigate } from 'react-router-dom';
import { logDev, logError } from '../../utils/logger';
import { useSafeContext } from '../../hooks/useSafeContext';
import { getDoc, setDoc } from 'firebase/firestore';
import { userNavigationRef } from '../../database/refs/userRefs';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from '../../database/configs/firebase';
import { fetchInitialContent } from '../../content/services/fetchInitialContent';
import {
	getNavigationStorage,
	setNavigationStorage,
} from '../../services/navigationStorage';
import type { NavigationState } from '../../types/states';
import { ContentfulContentContext } from '../ContentfulContentProvider/context';
import { FirebaseError } from 'firebase/app';

export function NavigationProvider({ children }: { children: ReactNode }) {
	const { modules } = useSafeContext(ContentfulContentContext);
	// * Estado com lazy initializer para a obtenção dos valores iniciais.
	const [navigationState, setNavigationState] =
		useState<NavigationState | null>(getNavigationStorage);
	const navigate = useNavigate();
	const skipNextSyncRef = useRef(false);

	useEffect(() => {
		// * useEffect responsável por atualizar o estado de navegação caso necessário.
		const handleNavigationState = async (user: User | null) => {
			if (user) {
				try {
					const navigationData = await getDoc(userNavigationRef(user.uid));
					if (!navigationData.exists()) return;
					skipNextSyncRef.current = true;
					setNavigationState(navigationData.data());
				} catch (error) {
					const isAuthError =
						error instanceof FirebaseError &&
						(error.code === 'permission-denied' ||
							error.code === 'unauthenticated');
					if (isAuthError) {
						await signOut(auth);
						void navigate('/', { replace: true });
					}
					logError({
						error,
						text: 'Não foi possível carregar seu histórico de navegação. Tente novamente.',
					});
				}
			} else {
				const navigationStorage = getNavigationStorage();
				if (navigationStorage) {
					setNavigationState(navigationStorage);
					return;
				}

				if (!modules) return;
				const initialProgressData = fetchInitialContent(modules);
				const initialNavigationState: NavigationState = {
					1: {
						currentTopic: initialProgressData.inProgressTopic,
						currentSubtopic: initialProgressData.inProgressSubtopic,
					},
				};
				setNavigationState(initialNavigationState);
			}
		};

		const unsubscribe = onAuthStateChanged(
			auth,
			(user) => void handleNavigationState(user),
		);

		return unsubscribe;
	}, [navigate, modules]);

	// * Setando os dados alterados em nosso local storage.
	useEffect(() => {
		if (!navigationState) return;

		setNavigationStorage(navigationState);
	}, [navigationState]);

	// * useEffect para atualização persistente dos dados de navegação do usuário no banco de dados.
	useEffect(() => {
		if (!navigationState) return;

		if (skipNextSyncRef.current) {
			skipNextSyncRef.current = false;
			return;
		}

		const uid = auth.currentUser?.uid;
		if (!uid) return;

		void setDoc(userNavigationRef(uid), navigationState).catch((error) =>
			logDev(error),
		);
	}, [navigationState]);

	return (
		<NavigationContext value={{ navigationState, setNavigationState }}>
			{children}
		</NavigationContext>
	);
}
