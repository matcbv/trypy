import { doc, getDoc } from 'firebase/firestore';
import { db } from '../database/firebase';
import { logError } from './logger';
import navegationInitialState from '../contexts/NavigationProvider/initialState';

export async function hydrateNavegationState(uid) {
	try {
		if (!uid) return navegationInitialState;

		const progress = await getDoc(doc(db, 'userProgress', uid));
		if (progress.exists()) {
			const progressData = progress.data();
			return {
				currentModule: progressData.inProgressModule,
				currentTopic: progressData.inProgressTopic,
				currentSubtopic: progressData.inProgressSubtopic,
			};
		} else {
			return navegationInitialState;
		}
	} catch (error) {
		logError(error);
		return navegationInitialState;
	}
}
