import type { ResolvedEntry } from '../../types/richText';
import type {
	ModuleData,
	SubtopicData,
	SubtopicTypes,
	TopicData,
} from '../../types/content';
import type { ModuleSkeleton } from '../../types/skeletons';
import type { Themes } from '../../constants/themeStyle';

// * Função responsável por converter o tipo das entries do Contentful para o tipo a ser trabalhado no projeto.
export function mapContent(
	rawContent: ResolvedEntry<ModuleSkeleton>,
): ModuleData {
	const content = rawContent.fields;

	const topics: TopicData[] = content.topics.map((rawTopic) => {
		const subtopics: SubtopicData[] = rawTopic!.fields.subtopics.map(
			(rawSubtopic) => ({
				...rawSubtopic!.fields,
				subtopicType: rawSubtopic!.fields.subtopicType as SubtopicTypes,
				videoDescription: rawSubtopic!.fields.videoDescription ?? null,
				videoLink: rawSubtopic!.fields.videoLink ?? null,
				solutionCode: rawSubtopic!.fields.solutionCode ?? null,
				testCode: rawSubtopic!.fields.testCode ?? null,
				starterCode: rawSubtopic!.fields.starterCode ?? null,
				expectedOutput: rawSubtopic!.fields.expectedOutput ?? null,
			}),
		);

		return { ...rawTopic!.fields, subtopics };
	});

	return {
		title: content.title,
		topics: topics,
		slug: content.slug,
		theme: content.theme as Themes,
		order: content.order,
	};
}
