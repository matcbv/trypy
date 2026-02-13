import { useContext, useEffect, useReducer } from 'react';
import reducer from './reducer';
import { NavigationContext } from './context';
import { Outlet } from 'react-router-dom';
import { storageKeys } from '../../constants/storageKeys';
import { AuthContext } from '../AuthProvider/context';
import actionTypes from './actionTypes';
import { logError } from '../../utils/logger';
import { hydrateNavegationState } from '../../utils/hydrateNavegationState';

export function NavigationProvider() {
	const { authState } = useContext(AuthContext);
	const [navigationState, navigationDispatch] = useReducer(
		reducer,
		null,
		getInitialModuleState,
	);

	function getInitialModuleState() {
		try {
			const storage = localStorage.getItem(storageKeys.NAVIGATION_STATE);
			return storage ? JSON.parse(storage) : null;
		} catch (error) {
			logError(error);
			return null;
		}
	}

	useEffect(() => {
		if (navigationState) return;

		(async () => {
			try {
				const progressData = await hydrateNavegationState(authState.uid);
				navigationDispatch({
					type: actionTypes.SET_CURRENT_PROGRESS,
					payload: progressData,
				});
			} catch (error) {
				logError(error);
			}
		})();
	}, [navigationState, authState.uid]);

	useEffect(() => {
		localStorage.setItem(
			storageKeys.MODULE_PROGRESS,
			JSON.stringify(navigationState),
		);
	}, [navigationState]);

	return (
		<NavigationContext value={{ navigationState, navigationDispatch }}>
			<Outlet />
		</NavigationContext>
	);
}
