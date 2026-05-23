import type { ResolvedEntry } from '../../types/richText';
import type { ModuleData, SubtopicData, TopicData } from '../../types/content';
import type { ModuleSkeleton } from '../../types/skeletons';

// * Função responsável por converter o tipo das entries do Contentful para o tipo a ser trabalhado no projeto.
export function mapContent(
	rawContent: ResolvedEntry<ModuleSkeleton>,
): ModuleData {
	const content = rawContent.fields;

	const topics: TopicData[] = content.topics.map((rawTopic) => {
		const subtopics: SubtopicData[] = rawTopic!.fields.subtopics.map(
			(rawSubtopic) => rawSubtopic!.fields,
		);

		return { ...rawTopic!.fields, subtopics };
	});

	return {
		title: content.title,
		topics: topics,
		slug: content.slug,
		order: content.order,
	};
}
