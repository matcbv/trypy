export function getNextContent(data) {
	const { topics, subtopics, currentTopic, currentSubtopic } = data;

	const nextSubtopic = subtopics.find(
		(subtopic) => subtopic.order === currentSubtopic.order + 1,
	);

	const nextTopic =
		topics.find((topic) => topic.order === currentTopic.order + 1) || null;

	if (nextSubtopic) {
		return [
			currentTopic,
			nextSubtopic,
			nextTopic ? false : nextSubtopic.order === subtopics.length,
		];
	}

	const newSubtopic = nextTopic?.subtopics.find(
		({ fields }) => fields.order === 1,
	);

	return [nextTopic, newSubtopic?.fields, false];
}
