import { storageKeys } from '../constants/storageKeys';
import type { NavigationState } from '../types/states';
import { logDev } from '../utils/logger';

export function getNavigationStorage() {
	try {
		const storage = localStorage.getItem(storageKeys.NAVIGATION_STATE);
		return storage ? (JSON.parse(storage) as NavigationState) : null;
	} catch (error) {
		logDev(error);
		return null;
	}
}

export function setNavigationStorage(data: NavigationState) {
	if (!data) return;

	try {
		const stringifiedData = JSON.stringify(data);
		localStorage.setItem(storageKeys.NAVIGATION_STATE, stringifiedData);
	} catch (error) {
		logDev(error);
	}
}

export function removeNavigationSorage() {
	try {
		localStorage.removeItem(storageKeys.NAVIGATION_STATE);
	} catch (error) {
		logDev(error);
	}
}
