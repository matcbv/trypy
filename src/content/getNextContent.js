import { fetchContent } from './fetchContent';

export async function getNextContent(
	currentModuleData,
	currentTopicData,
	currentSubtopicData,
) {
	// Iremos obter, respectivamente, os tópicos do módulo atual, o tópico atual, os subtópicos do tópico atual, o próximo subtópico e o próximo tópico.
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

	// Existindo um próximo subtópico, iremos passá-lo, enquanto o módulo e o tópico atual permanecem.
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

	// Obtendo o primeiro subtópico do próximo tópico.
	let newSubtopic = nextTopic?.subtopics.find(
		({ fields }) => fields.order === 1,
	);

	// Existindo o novo subtópico, o módulo permanece o mesmo, porém o tópico será o próximo.
	if (newSubtopic) {
		return {
			nextModule: currentModuleData,
			nextTopic: nextTopic,
			nextSubtopic: newSubtopic.fields,
			isLastSubtopic: newSubtopic.order === subtopics.length,
		};
	}

	// Caso o novo subtópico não exista, é sinal que o módulo chegou ao fim. Iremos obter o próximo módulo.
	const nextModule = await fetchContent({
		contentType: 'module',
		include: 4,
		orderOrSlug: currentModuleData.order + 1,
	});
	const newTopic = nextModule[0].fields.topics[0].fields;
	newSubtopic = newTopic.subtopics[0].fields;

	// Retornaremos o próximo módulo e os primeiros tópico e subtópico dele.
	return {
		nextModule: nextModule[0].fields,
		nextTopic: newTopic,
		nextSubtopic: newSubtopic,
		isLastSubtopic: true,
	};
}
