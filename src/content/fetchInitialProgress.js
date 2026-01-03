import { fetchContent } from './fetchContent';

export async function fetchInitialProgress() {
	const modules = await fetchContent('module', 3);
	const moduleFields = modules[0].fields;
	const topicFields = moduleFields.topics[0].fields;
	const subtopicFields = topicFields.subtopics[0].fields;

	const initialModule = moduleFields.slug;
	const initialTopic = topicFields.slug;
	const inProgressTopic = topicFields.slug;
	const initialSubtopic = subtopicFields.slug;
	return {
		currentModule: initialModule,
		currentTopic: initialTopic,
		currentSubtopic: initialSubtopic,
		inProgressTopic: inProgressTopic,
	};
}
