import type { ModuleData, SubtopicData, TopicData } from '../../types/content';

interface getNextContentProps {
	modules: ModuleData[];
	currentModuleData: ModuleData;
	currentTopicData: TopicData;
	currentSubtopicData: SubtopicData;
}

export function getNextContent({
	modules,
	currentModuleData,
	currentTopicData,
	currentSubtopicData,
}: getNextContentProps) {
	// * Iremos obter, respectivamente: os tópicos do módulo atual, os subtópicos do tópico atual, o próximo subtópico e o próximo tópico.
	const topics = currentModuleData.topics.map((topic) => topic);

	const subtopics = currentTopicData.subtopics.map((subtopic) => subtopic);

	const nextSubtopic = subtopics.find(
		(subtopic) => subtopic.order === currentSubtopicData.order + 1,
	);

	const nextTopic = topics.find(
		(topic) => topic.order === currentTopicData.order + 1,
	);

	// * Existindo um próximo subtópico, iremos passá-lo, enquanto o módulo e o tópico atual permanecem.
	if (nextSubtopic) {
		return {
			nextModule: currentModuleData,
			nextTopic: currentTopicData,
			nextSubtopic: nextSubtopic,
		};
	}

	// * Obtendo o primeiro subtópico do próximo tópico.
	const firstNextTopicSubtopic = nextTopic?.subtopics.find(
		(subtopic) => subtopic.order === 1,
	);

	// * Existindo o subtópico do próximo tópico, o módulo permanece o mesmo, porém o tópico e subtópico serão os próximos.
	if (nextTopic && firstNextTopicSubtopic) {
		return {
			nextModule: currentModuleData,
			nextTopic: nextTopic,
			nextSubtopic: firstNextTopicSubtopic,
		};
	}

	// * Caso o novo subtópico não exista, é sinal que o módulo chegou ao fim. Iremos obter o próximo módulo.
	const nextModule = modules.find(
		(module) => module.order === currentModuleData.order + 1,
	);

	// * Caso o próximo módulo existir, retornaremos ele, com seus primeiros tópico e subtópico.
	if (nextModule) {
		const nextModuleTopic = nextModule.topics[0]!;
		const nextTopicSubtopic = nextModuleTopic.subtopics[0]!;

		// * Retornaremos o próximo módulo e os primeiros tópico e subtópico dele.
		return {
			nextModule: nextModule,
			nextTopic: nextModuleTopic,
			nextSubtopic: nextTopicSubtopic,
		};
	}

	// * Caso contrário, a trilha de aprendizagem chegou ao fim. Iremos retornar os mesmo valores.
	return {
		nextModule: currentModuleData,
		nextTopic: currentTopicData,
		nextSubtopic: currentSubtopicData,
	};
}
