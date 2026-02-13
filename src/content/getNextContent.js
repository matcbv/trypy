import { fetchContent } from './fetchContent';

export async function getNextContent(
	currentModuleData,
	currentTopicData,
	currentSubtopicData,
) {
	const topics = currentModuleData.topics.map((topic) => topic.fields);
	const currentTopic = topics.find(
		(topic) => topic.slug === currentTopicData.slug,
	);
	const subtopics = currentTopic.subtopics.map((subtopic) => subtopic.fields);

	const nextSubtopic = subtopics.find(
		(subtopic) => subtopic.order === currentSubtopicData.order + 1,
	);

	const nextTopic =
		topics.find((topic) => topic.order === currentTopicData.order + 1) || null;

	if (nextSubtopic) {
		return {
			nextModule: currentModuleData,
			nextTopic: currentTopicData,
			nextSubtopic: nextSubtopic,
			isLastSubtopic: nextTopic
				? false
				: nextSubtopic.order === subtopics.length,
		};
	}

	let newSubtopic = nextTopic?.subtopics.find(
		({ fields }) => fields.order === 1,
	);

	if (newSubtopic) {
		return {
			nextModule: currentModuleData,
			nextTopic: nextTopic,
			nextSubtopic: newSubtopic.fields,
			isLastSubtopic: newSubtopic.order === subtopics.length,
		};
	}

	const nextModule = await fetchContent({
		contentType: 'module',
		include: 4,
		orderOrSlug: currentModuleData.order + 1,
	});
	const newTopic = nextModule[0].fields.topics[0].fields;
	newSubtopic = newTopic.subtopics[0].fields;

	return {
		nextModule: nextModule[0].fields,
		nextTopic: newTopic,
		nextSubtopic: newSubtopic,
		isLastSubtopic: true,
	};
}
