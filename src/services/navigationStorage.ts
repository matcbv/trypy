import { storageKeys } from '../constants/storageKeys';
import navigationInitialState from '../contexts/NavigationProvider/initialState';
import type { NavigationState } from '../types/states';
import { logError } from '../utils/logger';

export function getNavigationStorage() {
	try {
		const storage = localStorage.getItem(storageKeys.NAVIGATION_STATE);

		return storage
			? (JSON.parse(storage) as NavigationState)
			: navigationInitialState;
	} catch (error) {
		logError(error);
		return navigationInitialState;
	}
}

export function setNavigationStorage(data: NavigationState) {
	try {
		const stringifiedData = JSON.stringify(data);
		localStorage.setItem(storageKeys.NAVIGATION_STATE, stringifiedData);
	} catch (error) {
		logError(error);
	}
}

export function removeNavigationSorage() {
	try {
		localStorage.removeItem(storageKeys.NAVIGATION_STATE);
	} catch (error) {
		logError(error);
	}
}
