import { doc, getDoc } from 'firebase/firestore';
import { db } from '../database/firebase';
import navigationInitialState from '../contexts/NavigationProvider/initialState';

// Função responsável por atualizar o localStorage contendo os dados de navegação do usuário.
export async function hydrateNavigationState(uid) {
	if (!uid) return navigationInitialState;

	const progress = await getDoc(doc(db, 'userProgress', uid));
	if (progress.exists()) {
		const progressData = progress.data();
		return {
			currentModule: progressData.inProgressModule,
			currentTopic: progressData.inProgressTopic,
			currentSubtopic: progressData.inProgressSubtopic,
		};
	} else {
		return navigationInitialState;
	}
}
