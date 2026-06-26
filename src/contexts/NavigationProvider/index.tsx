import { useEffect, useState, type ReactNode } from 'react';
import { NavigationContext } from './context';
import { useNavigate } from 'react-router-dom';
import { storageKeys } from '../../constants/storageKeys';
import { AuthContext } from '../AuthProvider/context';
import { logError } from '../../utils/logger';
import { useSafeContext } from '../../hooks/useSafeContext';
import type { NavigationState } from '../../types/states';
import { getDoc } from 'firebase/firestore';
import { userNavigationRef } from '../../database/refs/userRefs';
import initialState from './initialState';
import { signOut } from 'firebase/auth';
import { auth } from '../../database/configs/firebase';

export function NavigationProvider({ children }: { children: ReactNode }) {
	const { authState } = useSafeContext(AuthContext);
	const [navigationState, setNavigationState] = useState(getInitialModuleState);
	const navigate = useNavigate();

	// * Lazy initializer para a obtenção dos valores iniciais do nosso estado.
	function getInitialModuleState() {
		try {
			const storage = localStorage.getItem(storageKeys.NAVIGATION_STATE);

			return storage ? (JSON.parse(storage) as NavigationState) : initialState;
		} catch (error) {
			logError(error);
			return initialState;
		}
	}

	useEffect(() => {
		// * useEffect responsável por atualizar o estado de navegação caso necessário.
		void (async () => {
			if (Object.keys(navigationState).length > 0 || !authState.uid) return;

			try {
				const navigationData = await getDoc(userNavigationRef(authState.uid));

				if (!navigationData.exists()) return;

				setNavigationState(navigationData.data());
			} catch (error) {
				await signOut(auth);
				void navigate('/', { replace: true });
				logError(
					error,
					'Não foi possível carregar seu histórico de navegação. Tente novamente.',
				);
			}
		})();
	}, [navigationState, authState.uid, navigate]);

	// * Setando os dados alterados em nosso local storage.
	useEffect(() => {
		localStorage.setItem(
			storageKeys.NAVIGATION_STATE,
			JSON.stringify(navigationState),
		);
	}, [navigationState]);

	return (
		<NavigationContext value={{ navigationState, setNavigationState }}>
			{children}
		</NavigationContext>
	);
}
