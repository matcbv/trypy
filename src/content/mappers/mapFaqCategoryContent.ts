import type { ResolvedEntry } from '../../types/richText';
import type { FaqCategory } from '../../types/content';
import type { FaqCategorySkeleton } from '../../types/skeletons';

// * Função responsável por converter o tipo das entries do Contentful para o tipo a ser trabalhado no projeto.
export function mapFaqCategoryContent(
	rawContent: ResolvedEntry<FaqCategorySkeleton>[],
): FaqCategory[] {
	const faqCategories = rawContent.map((faqCategory) => {
		const questions = faqCategory.fields.questions.map((question) => ({
			question: question!.fields.question,
			answer: question!.fields.answer,
			order: question!.fields.order,
		}));

		const icon = faqCategory.fields.icon;

		if (!icon) {
			throw new Error(
				`A categoria "${faqCategory.fields.name}" não possui um ícone válido.`,
			);
		}

		return {
			name: faqCategory.fields.name,
			description: faqCategory.fields.description,
			icon,
			slug: faqCategory.fields.slug,
			order: faqCategory.fields.order,
			questions,
		};
	});

	return faqCategories;
}
