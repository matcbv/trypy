import type { ResolvedEntry } from '../../types/richText';
import type { ModuleData, SubtopicTypes } from '../../types/content';
import type { ModuleSkeleton } from '../../types/skeletons';
import type { Themes } from '../../constants/themeStyle';

// * Função responsável por converter o tipo das entries do Contentful para o tipo a ser trabalhado no projeto.
export function mapContent(
	rawContent: ResolvedEntry<ModuleSkeleton>[],
): ModuleData[] {
	const modules = rawContent.map((module) => {
		const topics = module.fields.topics.map((topic) => {
			const subtopics = topic!.fields.subtopics.map((subtopic) => ({
				...subtopic!.fields,
				subtopicType: subtopic!.fields.subtopicType as SubtopicTypes,
			}));
			return {
				title: topic!.fields.title,
				slug: topic!.fields.slug,
				order: topic!.fields.order,
				subtopics: subtopics,
			};
		});

		return {
			slug: module.fields.slug,
			title: module.fields.title,
			order: module.fields.order,
			theme: module.fields.theme as Themes,
			topics: topics,
		};
	});

	return modules;
}
