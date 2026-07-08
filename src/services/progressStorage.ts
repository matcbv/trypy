import { storageKeys } from '../constants/storageKeys';
import progressInitialState from '../contexts/ProgressProvider/initialState';
import type { ProgressState } from '../types/states';
import { logError } from '../utils/logger';

export function getProgressStorage() {
	try {
		const storage = localStorage.getItem(storageKeys.PROGRESS_STATE);
		if (!storage) return progressInitialState;
		return JSON.parse(storage) as ProgressState;
	} catch (error) {
		logError({ error });
		return progressInitialState;
	}
}

export function setProgressStorage(data: ProgressState) {
	try {
		const stringifiedData = JSON.stringify(data);
		localStorage.setItem(storageKeys.PROGRESS_STATE, stringifiedData);
	} catch (error) {
		logError({ error });
	}
}

export function removeProgressSorage() {
	try {
		localStorage.removeItem(storageKeys.PROGRESS_STATE);
	} catch (error) {
		logError({ error });
	}
}
