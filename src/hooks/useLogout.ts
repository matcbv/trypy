import { signOut } from 'firebase/auth';
import { useCallback } from 'react';
import { auth } from '../database/configs/firebase';
import { removeNavigationSorage } from '../services/navigationStorage';
import { removeProgressStorage } from '../services/progressStorage';
import { AuthContext } from '../contexts/AuthProvider/context';
import { useSafeContext } from './useSafeContext';
import { ProgressContext } from '../contexts/ProgressProvider/context';
import { NavigationContext } from '../contexts/NavigationProvider/context';
import authInitialState from '../contexts/AuthProvider/initialState';
import progressInitialState from '../contexts/ProgressProvider/initialState';

export function useLogout() {
	const { setAuthState } = useSafeContext(AuthContext);
	const { setProgressState } = useSafeContext(ProgressContext);
	const { setNavigationState } = useSafeContext(NavigationContext);

	return useCallback(async () => {
		await signOut(auth);
		removeNavigationSorage();
		removeProgressStorage();
		setAuthState(authInitialState);
		setProgressState(progressInitialState);
		setNavigationState(null);
	}, [setAuthState, setNavigationState, setProgressState]);
}
