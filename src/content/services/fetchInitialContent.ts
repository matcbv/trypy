import type { ModuleData } from '../../types/content';
import type { ProgressState } from '../../types/states';

// * Função responsável pela requisição do conteúdo inicial para ser vinculado ao usuário. Com ela, eliminamos hard coding e promovemos a automação com a plataforma do Contentful, em casos de futuras alterações.
export function fetchInitialContent(modules: ModuleData[]): ProgressState {
	const firstModule = modules[0];
	const firstTopic = firstModule!.topics[0];
	const firstSubtopic = firstTopic!.subtopics[0];

	return {
		inProgressModule: firstModule!.slug,
		inProgressTopic: firstTopic!.slug,
		inProgressSubtopic: firstSubtopic!.slug,
		doneModules: [],
		doneTopics: [],
		doneSubtopics: [],
	};
}
