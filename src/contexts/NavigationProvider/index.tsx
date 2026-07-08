import { useEffect, useState, type ReactNode } from 'react';
import { NavigationContext } from './context';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthProvider/context';
import { logError } from '../../utils/logger';
import { useSafeContext } from '../../hooks/useSafeContext';
import { getDoc } from 'firebase/firestore';
import { userNavigationRef } from '../../database/refs/userRefs';
import { signOut } from 'firebase/auth';
import { auth } from '../../database/configs/firebase';
import type { UserNavigation } from '../../types/user';
import { fetchInitialProgress } from '../../content/services/fetchInitialProgress';
import {
	getNavigationStorage,
	setNavigationStorage,
} from '../../services/navigationStorage';

export function NavigationProvider({ children }: { children: ReactNode }) {
	const { authState } = useSafeContext(AuthContext);
	// * Estado com lazy initializer para a obtenção dos valores iniciais.
	const [navigationState, setNavigationState] = useState(getNavigationStorage);
	const navigate = useNavigate();

	useEffect(() => {
		// * useEffect responsável por atualizar o estado de navegação caso necessário.
		void (async () => {
			if (Object.keys(navigationState).length > 0) return;

			if (authState.uid) {
				try {
					const navigationData = await getDoc(userNavigationRef(authState.uid));
					if (!navigationData.exists()) return;
					setNavigationState(navigationData.data());
				} catch (error) {
					await signOut(auth);
					void navigate('/', { replace: true });
					logError({
						error,
						text: 'Não foi possível carregar seu histórico de navegação. Tente novamente.',
					});
				}
			} else {
				try {
					const initialProgressData = await fetchInitialProgress();
					const initialNavigationState: UserNavigation = {
						1: {
							currentTopic: initialProgressData.inProgressTopic,
							currentSubtopic: initialProgressData.inProgressSubtopic,
						},
					};
					setNavigationState(initialNavigationState);
				} catch (error) {
					logError({
						error,
						text: 'Não foi possível obter os dados iniciais de navegação. Tente novamente.',
					});
				}
			}
		})();
	}, [navigationState, authState.uid, navigate]);

	// * Setando os dados alterados em nosso local storage.
	useEffect(() => {
		setNavigationStorage(navigationState);
	}, [navigationState]);

	return (
		<NavigationContext value={{ navigationState, setNavigationState }}>
			{children}
		</NavigationContext>
	);
}
