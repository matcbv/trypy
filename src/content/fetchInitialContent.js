import { fetchContent } from './fetchContent';

export async function fetchInitialContent() {
	const modules = await fetchContent({ contentType: 'module', include: 3 });
	const firstModule = modules[0].fields;
	const firstTopic = firstModule.topics[0].fields;
	const firstSubtopic = firstTopic.subtopics[0].fields;

	return {
		initialModule: firstModule.slug,
		initialTopic: firstTopic.slug,
		initialSubtopic: firstSubtopic.slug,
	};
}
