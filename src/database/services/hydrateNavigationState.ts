import { getDoc } from 'firebase/firestore';
import navigationInitialState from '../../contexts/NavigationProvider/initialState';
import { userProgressRef } from '../../database/refs/userRefs';

// * Função responsável por atualizar o localStorage contendo os dados de navegação do usuário.
export async function hydrateNavigationState(uid: string) {
	const progress = await getDoc(userProgressRef(uid));
	if (progress.exists()) {
		const progressData = progress.data();
		return {
			currentModule: progressData.inProgressModule,
			currentTopic: progressData.inProgressTopic,
			currentSubtopic: progressData.inProgressSubtopic,
		};
	}
	return navigationInitialState;
}
