import { useEffect, useState, type ReactNode } from 'react';
import { ProgressContext } from './context';
import { getDoc } from 'firebase/firestore';
import { auth } from '../../database/configs/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { userProgressRef } from '../../database/refs/userRefs';
import { fetchInitialContent } from '../../content/services/fetchInitialContent';
import { logError } from '../../utils/logger';
import { useNavigate } from 'react-router-dom';
import {
	getProgressStorage,
	setProgressStorage,
} from '../../services/storage/progressStorage';
import type { ProgressState } from '../../types/states';
import { useSafeContext } from '../../hooks/useSafeContext';
import { ContentfulContentContext } from '../ContentfulContentProvider/context';
import { FirebaseError } from 'firebase/app';
import { isProgressInitialized } from '../../utils/progress';
import { signOutAndClear } from '../../services/auth/signOutAndClear';
import { sharedToasts } from '../../constants/errorMessages';

export function ProgressProvider({ children }: { children: ReactNode }) {
	const { modules } = useSafeContext(ContentfulContentContext);
	const [progressState, setProgressState] =
		useState<ProgressState>(getProgressStorage);
	const navigate = useNavigate();

	useEffect(() => {
		let requestId = 0;

		const handleProgressState = async (user: User | null) => {
			const currentRequestId = ++requestId;

			if (user) {
				try {
					const progressData = await getDoc(userProgressRef(user.uid));

					if (currentRequestId !== requestId) return;

					setProgressState((prev) => ({
						...prev,
						...progressData.data(),
					}));
				} catch (error) {
					if (currentRequestId !== requestId) return;

					const isAuthError =
						error instanceof FirebaseError &&
						(error.code === 'permission-denied' ||
							error.code === 'unauthenticated');

					if (isAuthError) {
						await signOutAndClear();
						void navigate('/', { replace: true });
						logError({
							error,
							...sharedToasts.sessionError,
						});
						return;
					}

					logError({
						error,
						...sharedToasts.loadDataError,
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

		return () => {
			requestId++;
			unsubscribe();
		};
	}, [navigate, modules]);

	useEffect(() => {
		setProgressStorage(progressState);
	}, [progressState]);

	return (
		<ProgressContext value={{ progressState, setProgressState }}>
			{children}
		</ProgressContext>
	);
}
