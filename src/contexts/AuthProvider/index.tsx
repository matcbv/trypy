import { auth } from '../../database/configs/firebase';
import { useEffect, useState, type ReactNode } from 'react';
import initialState from './initialState';
import { AuthContext } from './context';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getDoc } from 'firebase/firestore';
import { userDataRef } from '../../database/refs/userRefs';
import { logError } from '../../utils/logger';
import { useNavigate } from 'react-router-dom';
import type { AuthState } from '../../types/states';
import { signOutAndClear } from '../../services/auth/signOutAndClear';
import { sharedToasts } from '../../constants/errorMessages';
import { FirebaseError } from 'firebase/app';

export function AuthProvider({ children }: { children: ReactNode }) {
	const [authState, setAuthState] = useState<AuthState>(initialState);
	const navigate = useNavigate();

	useEffect(() => {
		let requestId = 0;

		const handleAuthState = async (user: User | null) => {
			const currentRequestId = ++requestId;

			if (user) {
				setAuthState((prev) => ({ ...prev, loading: true }));

				try {
					const userData = await getDoc(userDataRef(user.uid));

					if (currentRequestId !== requestId) return;

					setAuthState((prev) => ({
						...prev,
						data: userData.data() ?? null,
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
				} finally {
					if (currentRequestId === requestId) {
						setAuthState((prev) => ({ ...prev, loading: false }));
					}
				}
			} else {
				setAuthState(() => ({
					...initialState,
					loading: false,
				}));
			}
		};

		const unsubscribe = onAuthStateChanged(
			auth,
			(user) => void handleAuthState(user),
		);

		return () => {
			requestId++;
			unsubscribe();
		};
	}, [navigate]);

	return (
		<AuthContext value={{ authState, setAuthState }}>{children}</AuthContext>
	);
}
