import { useEffect, useState } from 'react';
import { NavigationContext } from './context';
import { Outlet } from 'react-router-dom';
import { storageKeys } from '../../constants/storageKeys';
import { AuthContext } from '../AuthProvider/context';
import { logError } from '../../utils/logger';
import { useSafeContext } from '../../hooks/useSafeContext';
import type { NavigationState } from '../../types/states';
import { getDoc } from 'firebase/firestore';
import { userNavigationRef } from '../../database/refs/userRefs';
import { toast } from 'react-toastify';
import type { ToastData } from '../../types/toast';
import { ToastNotification } from '../../components/Notifications';
import initialState from './initialState';

export function NavigationProvider() {
	const { authState } = useSafeContext(AuthContext);
	const [navigationState, setNavigationState] = useState(getInitialModuleState);

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
		// * Atualizando nosso local storage caso inexistente.
		void (async () => {
			if (Object.keys(navigationState).length > 0 || !authState.uid) return;

			try {
				const navigationData = await getDoc(userNavigationRef(authState.uid));
				if (!navigationData.exists()) {
					toast<ToastData>(ToastNotification, {
						type: 'error',
						data: {
							type: 'error',
							text: 'Não foi possível carregar seu histórico de navegação. Tente novamente ou fale conosco.',
						},
					});
					throw new Error(
						'Erro na requisição dos dados de navegação do usuário.',
					);
				}
				setNavigationState(navigationData.data());
			} catch (error) {
				logError(error);
			}
		})();
	}, [navigationState, authState.uid]);

	// * Setando os dados alterados em nosso local storage.
	useEffect(() => {
		localStorage.setItem(
			storageKeys.NAVIGATION_STATE,
			JSON.stringify(navigationState),
		);
	}, [navigationState]);

	return (
		<NavigationContext value={{ navigationState, setNavigationState }}>
			<Outlet />
		</NavigationContext>
	);
}
