import { doc, setDoc } from 'firebase/firestore';
import { fetchInitialContent } from '../content/fetchInitialContent';
import initialStateProgress from '../contexts/ProgressProvider/initialState';
import { db } from '../database/firebase';

// Função responsável pela criação do progresso do usuário no banco de dados.
export async function createInitialProgress(uid) {
	// Obtendo o conteúdo inicial a ser adicionado.
	const { initialModule, initialTopic, initialSubtopic } =
		await fetchInitialContent();

	const progressData = {
		...initialStateProgress,
		inProgressModule: initialModule,
		inProgressTopic: initialTopic,
		inProgressSubtopic: initialSubtopic,
	};

	await setDoc(doc(db, 'userProgress', uid), progressData);

	return progressData;
}
