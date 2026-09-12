import { auth } from '../../database/configs/firebase';
import { useEffect, useState, type ReactNode } from 'react';
import initialState from './initialState';
import { AuthContext } from './context';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { getDoc } from 'firebase/firestore';
import { userDataRef } from '../../database/refs/userRefs';
import { logError } from '../../utils/logger';
import { useNavigate } from 'react-router-dom';
import type { AuthState } from '../../types/states';

export function AuthProvider({ children }: { children: ReactNode }) {
	const [authState, setAuthState] = useState<AuthState>(initialState);
	const navigate = useNavigate();

	useEffect(() => {
		const handleAuthState = async (user: User | null) => {
			setAuthState((prev) => ({ ...prev, loading: true }));
			try {
				if (user) {
					const userData = await getDoc(userDataRef(user.uid));
					if (!userData.exists()) return;
					setAuthState((prev) => ({
						...prev,
						uid: user.uid,
						data: userData.data(),
					}));
				} else {
					setAuthState(initialState);
				}
			} catch (error) {
				await signOut(auth);
				void navigate('/', { replace: true });
				logError({
					error,
					text: 'Não foi possível renovar a sessão. Faça login novamente.',
				});
			} finally {
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
