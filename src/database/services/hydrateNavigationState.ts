import { getDoc } from 'firebase/firestore';
import { userProgressRef } from '../../database/refs/userRefs';
import initialStateNavigation from '../../contexts/NavigationProvider/initialState';
import type { NavigationState } from '../../types/states';

// * Função responsável por atualizar o localStorage contendo os dados de navegação do usuário.
export async function hydrateNavigationState(uid: string) {
	const progress = await getDoc(userProgressRef(uid));
	if (progress.exists()) {
		const progressData = progress.data();

		return {
			currentModule: progressData.inProgressModule,
			currentTopic: progressData.inProgressTopic,
			currentSubtopic: progressData.inProgressSubtopic,
			isHydrated: true,
		} as NavigationState;
	}

	return initialStateNavigation;
}
