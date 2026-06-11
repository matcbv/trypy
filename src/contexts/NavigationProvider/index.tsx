import { useEffect, useReducer } from 'react';
import reducer from './reducer';
import { NavigationContext } from './context';
import { Outlet } from 'react-router-dom';
import { storageKeys } from '../../constants/storageKeys';
import { AuthContext } from '../AuthProvider/context';
import actionTypes from './actionTypes';
import { logError } from '../../utils/logger';
import { hydrateNavigationState } from '../../database/services/hydrateNavigationState';
import { useSafeContext } from '../../hooks/useSafeContext';
import type { NavigationState } from '../../types/states';
import initialState from './initialState';

export function NavigationProvider() {
	const { authState } = useSafeContext(AuthContext);
	const [navigationState, navigationDispatch] = useReducer(
		reducer,
		null,
		getInitialModuleState,
	);

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
			if (navigationState.isHydrated || !authState.uid) return;

			try {
				const progressData = await hydrateNavigationState(authState.uid);
				navigationDispatch({
					type: actionTypes.SET_CURRENT_PROGRESS,
					payload: progressData,
				});
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
		<NavigationContext value={{ navigationState, navigationDispatch }}>
			<Outlet />
		</NavigationContext>
	);
}
