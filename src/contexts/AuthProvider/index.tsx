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
import { signOutAndClear } from '../../services/signOutAndClear';
import { sharedToasts } from '../../constants/errorMessages';

export function AuthProvider({ children }: { children: ReactNode }) {
	const [authState, setAuthState] = useState<AuthState>(initialState);
	const navigate = useNavigate();

	useEffect(() => {
		const handleAuthState = async (user: User | null) => {
			setAuthState((prev) => ({ ...prev, loading: true }));

			if (user) {
				try {
					const userData = await getDoc(userDataRef(user.uid));
					if (!userData.exists()) return;
					setAuthState((prev) => ({
						...prev,
						uid: user.uid,
						data: userData.data(),
					}));
				} catch (error) {
					await signOutAndClear();
					void navigate('/', { replace: true });
					logError({
						error,
						...sharedToasts.sessionError,
					});
				} finally {
					setAuthState((prev) => ({ ...prev, loading: false }));
				}
			} else {
				setAuthState(initialState);
				setAuthState((prev) => ({ ...prev, loading: false }));
			}
		};

		const unsubscribe = onAuthStateChanged(
			auth,
			(user) => void handleAuthState(user),
		);

		return unsubscribe;
	}, [navigate]);

	return (
		<AuthContext value={{ authState, setAuthState }}>{children}</AuthContext>
	);
}
