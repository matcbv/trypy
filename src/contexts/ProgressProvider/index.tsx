import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ProgressContext } from './context';
import { getDoc, setDoc } from 'firebase/firestore';
import { auth } from '../../database/configs/firebase';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { userProgressRef } from '../../database/refs/userRefs';
import { fetchInitialContent } from '../../content/services/fetchInitialContent';
import { logDev, logError } from '../../utils/logger';
import { useNavigate } from 'react-router-dom';
import {
	getProgressStorage,
	setProgressStorage,
} from '../../services/progressStorage';
import type { ProgressState } from '../../types/states';
import { useSafeContext } from '../../hooks/useSafeContext';
import { ContentfulContentContext } from '../ContentfulContentProvider/context';
import { FirebaseError } from 'firebase/app';
import { isProgressInitialized } from '../../utils/progress';

export function ProgressProvider({ children }: { children: ReactNode }) {
	const { modules } = useSafeContext(ContentfulContentContext);
	const [progressState, setProgressState] =
		useState<ProgressState>(getProgressStorage);
	const navigate = useNavigate();
	const skipNextSyncRef = useRef(false);

	useEffect(() => {
		const handleProgressState = async (user: User | null) => {
			if (user) {
				try {
					const progressData = await getDoc(userProgressRef(user.uid));
					if (!progressData.exists()) return;
					skipNextSyncRef.current = true;
					setProgressState((prev) => ({ ...prev, ...progressData.data() }));
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
						text: 'Não foi possível carregar seu histórico de progresso. Tente novamente.',
					});
				}
			} else {
				const progressStorage = getProgressStorage();
				if (isProgressInitialized(progressStorage)) {
					setProgressState(progressStorage);
					return;
				}
				if (!modules) return;
				const initialProgressData = fetchInitialContent(modules);
				setProgressState(initialProgressData);
			}
		};

		const unsubscribe = onAuthStateChanged(
			auth,
			(user) => void handleProgressState(user),
		);

		return unsubscribe;
	}, [navigate, modules]);

	useEffect(() => {
		setProgressStorage(progressState);
	}, [progressState]);

	useEffect(() => {
		if (skipNextSyncRef.current) {
			skipNextSyncRef.current = false;
			return;
		}

		const uid = auth.currentUser?.uid;
		if (!uid) return;

		void setDoc(userProgressRef(uid), progressState).catch((error) => {
			logDev(error);
		});
	}, [progressState]);

	return (
		<ProgressContext value={{ progressState, setProgressState }}>
			{children}
		</ProgressContext>
	);
}
