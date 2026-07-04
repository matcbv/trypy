import { useEffect, useState, type ReactNode } from 'react';
import { ProgressContext } from './context';
import { getDoc } from 'firebase/firestore';
import { auth } from '../../database/configs/firebase';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { userProgressRef } from '../../database/refs/userRefs';
import { fetchInitialProgress } from '../../content/services/fetchInitialProgress';
import { logError } from '../../utils/logger';
import { useNavigate } from 'react-router-dom';
import {
	getProgressStorage,
	setProgressStorage,
} from '../../services/progressStorage';
import type { ProgressState } from '../../types/states';

export function ProgressProvider({ children }: { children: ReactNode }) {
	const [progressState, setProgressState] = useState(getProgressStorage);
	const navigate = useNavigate();

	function isProgressInitialized(progress: ProgressState) {
		return (
			progress.inProgressModule !== '' &&
			progress.inProgressTopic !== '' &&
			progress.inProgressSubtopic !== ''
		);
	}

	useEffect(() => {
		const handleProgressState = async (user: User | null) => {
			if (user) {
				try {
					const progressData = await getDoc(userProgressRef(user.uid));
					if (!progressData.exists()) return;
					setProgressState((prev) => ({ ...prev, ...progressData.data() }));
				} catch (error) {
					await signOut(auth);
					void navigate('/', { replace: true });
					logError(
						error,
						'Não foi possível carregar seu histórico de progresso. Tente novamente.',
					);
				}
			} else {
				try {
					const progressStorage = getProgressStorage();
					if (isProgressInitialized(progressStorage)) {
						setProgressState(progressStorage);
						return;
					}
					const initialProgressData = await fetchInitialProgress();
					setProgressState(initialProgressData);
				} catch (error) {
					logError(
						error,
						'Não foi possível obter os dados iniciais de progresso. Tente novamente.',
					);
				}
			}
		};

		const unsubscribe = onAuthStateChanged(
			auth,
			(user) => void handleProgressState(user),
		);

		return unsubscribe;
	}, [navigate]);

	useEffect(() => {
		setProgressStorage(progressState);
	}, [progressState]);

	return (
		<ProgressContext value={{ progressState, setProgressState }}>
			{children}
		</ProgressContext>
	);
}
