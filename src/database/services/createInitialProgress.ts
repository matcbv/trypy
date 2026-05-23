import { setDoc } from 'firebase/firestore';
import { fetchInitialContent } from '../../content/services/fetchInitialContent';
import initialStateProgress from '../../contexts/ProgressProvider/initialState';
import { userProgressRef } from '../refs/userRefs';

// * Função responsável pela criação do progresso do usuário no banco de dados.
export async function createInitialProgress(uid: string) {
	// * Obtendo o conteúdo inicial a ser adicionado.
	const { initialModule, initialTopic, initialSubtopic } =
		await fetchInitialContent();

	const progressData = {
		...initialStateProgress,
		inProgressModule: initialModule,
		inProgressTopic: initialTopic,
		inProgressSubtopic: initialSubtopic,
	};

	await setDoc(userProgressRef(uid), progressData);

	return progressData;
}
