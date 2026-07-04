import type { ProgressState } from '../../types/states';
import { fetchContent } from './fetchContent';

// * Função responsável pela requisição do conteúdo inicial para ser vinculado ao usuário. Com ela, eliminamos hard coding e promovemos a automação com a plataforma do Contentful, em casos de futuras alterações.
export async function fetchInitialProgress(): Promise<ProgressState> {
	const modules = await fetchContent({ contentType: 'module', include: 2 });
	const firstModule = modules[0]?.fields;
	const firstTopic = firstModule?.topics[0]?.fields;
	const firstSubtopic = firstTopic?.subtopics[0]?.fields;
	if (!firstModule || !firstTopic || !firstSubtopic) {
		throw new Error('Falha ao obter o conteúdo inicial.');
	}

	return {
		inProgressModule: firstModule.slug,
		inProgressTopic: firstTopic.slug,
		inProgressSubtopic: firstSubtopic.slug,
		doneModules: [],
		doneTopics: [],
		doneSubtopics: [],
	};
}
