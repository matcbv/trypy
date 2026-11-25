import { useEffect, useState } from 'react';
import { LoadingPage } from './LoadingPage';
import { ErrorPage } from './ErrorPage';
import { ContentfulContentContext } from '../contexts/ContentfulContentProvider/context';
import { useSafeContext } from '../hooks/useSafeContext';
import { FaqCategory } from '../components/FaqCategory';
import type { Block, Inline } from '@contentful/rich-text-types';
import type { Node, Text } from '@contentful/rich-text-types';
import type { FaqQuestion } from '../types/content';
import { contentfulFormatter } from '../content/formatters/contentfulFormatter';
import type { ResolvedAsset } from '../types/richText';

interface SearchResultProps {
	categoryIcon: ResolvedAsset;
	categoryName: string;
	question: FaqQuestion;
}

function normalizeText(value: string): string {
	return value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.trim()
		.toLowerCase();
}

function getText(node: Node): string {
	if (node.nodeType === 'text') {
		const textNode = node as Text;
		return textNode.value;
	}

	const narrowedNode = node as Block | Inline;
	return narrowedNode.content?.map(getText).join('') ?? '';
}

export function Faq() {
	const { faqCategories, isLoading, errorData, refreshFaqCategories } =
		useSafeContext(ContentfulContentContext);
	const [searchValue, setSearchValue] = useState('');
	const [searchResult, setSearchResult] = useState<SearchResultProps[]>([]);

	useEffect(() => {
		const search = normalizeText(searchValue);

		if (!search) {
			setSearchResult([]);
			return;
		}

		const results: SearchResultProps[] = [];

		faqCategories!.forEach((category) => {
			category.questions.forEach((question) => {
				const textContent = normalizeText(
					`${question.question} ${getText(question.answer)}`,
				);

				if (textContent.includes(search)) {
					results.push({
						categoryIcon: category.icon,
						categoryName: category.name,
						question,
					});
				}
			});
		});

		setSearchResult(results);
	}, [faqCategories, searchValue, setSearchResult]);

	if (errorData.error) {
		return <ErrorPage onRetry={refreshFaqCategories} />;
	} else {
		return isLoading.faqCategories ? (
			<LoadingPage />
		) : (
			<div className="flex min-h-screen items-center justify-center">
				<div
					className="relative mx-5 my-30 w-full max-w-100 lg:max-w-200"
					style={
						{
							'--highlight-theme-color': 'var(--color-main-purple)',
						} as React.CSSProperties
					}
				>
					<div className="mb-10 flex flex-col gap-y-3">
						<h1 className="text-title-4xl text-main-purple">
							Precisa de ajuda?
						</h1>
						<p className="text-section-lg">
							Pesquise ou navegue pelas categorias abaixo para encontrar a
							resposta que procura.
						</p>
					</div>
					<div className="relative mb-5">
						<input
							type="search"
							value={searchValue}
							className="h-10 w-full rounded-full border-2 border-white/10 bg-white/10 pr-8 pl-3 outline-none placeholder:text-gray-400 focus:shadow-[0_0_15px_#ffffff]/15 lg:cursor-pointer lg:transition-shadow lg:duration-300"
							onChange={(e) => setSearchValue(e.currentTarget.value)}
							placeholder="Digite sua dúvida ou palavra-chave.."
						/>
						<img
							src={`/assets/images/icons/${searchValue ? 'cancel' : 'search'}.png`}
							alt={searchValue ? 'Cancelar' : 'Pesquisar'}
							className="absolute top-1/2 right-0 -translate-x-1/2 -translate-y-1/2 lg:cursor-pointer"
							onClick={() => setSearchValue('')}
						/>
					</div>
					{searchResult.length > 0 ? (
						searchResult.map(({ categoryIcon, categoryName, question }) => (
							<div className="mb-5 flex flex-col gap-y-3 rounded-md bg-black/40 p-5">
								<h2 className="text-section-lg flex items-center gap-x-3">
									<img
										src={categoryIcon.fields.file?.url}
										alt={categoryIcon.fields.description}
										className="drop-shadow-[0_0_10px_var(--color-main-purple)]/50"
									/>
									{categoryName}
								</h2>
								<h3 className="text-main-purple font-bold">
									{question.question}
								</h3>
								{contentfulFormatter(question.answer)}
							</div>
						))
					) : (
						<div className="rounded-md bg-black/40 shadow-[0_0_40px_#000000]/40">
							{faqCategories!.map((category, i) => (
								<div key={i}>
									<FaqCategory category={category} />
									{i < faqCategories!.length - 1 && (
										<hr className="border-gray-400" />
									)}
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		);
	}
}
