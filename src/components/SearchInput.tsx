import { useEffect, type SetStateAction } from 'react';
import type { ModuleData } from '../types/content';
import {
	type Block,
	type Inline,
	type Node,
	type Text,
} from '@contentful/rich-text-types';
import type { SearchResult } from './ModuleSideBar';

interface SearchInputProps {
	currentModule: ModuleData;
	searchValue: string;
	setSearchValue: React.Dispatch<SetStateAction<string>>;
	setSearchResult: React.Dispatch<SetStateAction<SearchResult[]>>;
	isTopicBlocked: (topicSlug: string) => boolean;
}

function getText(node: Node): string {
	if (node.nodeType === 'text') {
		const textNode = node as Text;
		return textNode.value;
	}

	const narrowedNode = node as Block | Inline;
	return narrowedNode.content?.map(getText).join('') ?? '';
}

function normalizeText(value: string): string {
	return value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.trim()
		.toLowerCase();
}

export function SearchInput({
	currentModule,
	searchValue,
	setSearchValue,
	setSearchResult,
	isTopicBlocked,
}: SearchInputProps) {
	useEffect(() => {
		const search = normalizeText(searchValue);

		if (!search) {
			setSearchResult([]);
			return;
		}

		const results: SearchResult[] = [];

		currentModule.topics.forEach((topic) => {
			if (isTopicBlocked(topic.slug)) return;

			topic.subtopics.forEach((subtopic) => {
				if (!subtopic.content) return;

				const textContent = normalizeText(getText(subtopic.content));

				if (textContent.includes(search)) {
					results.push({
						topicSlug: topic.slug,
						subtopicTitle: subtopic.title,
						subtopicSlug: subtopic.slug,
						subtopicType: subtopic.subtopicType,
					});
				}
			});
		});

		setSearchResult(results);
	}, [searchValue, currentModule, setSearchResult, isTopicBlocked]);

	return (
		<div className="relative mb-4">
			<input
				type="search"
				value={searchValue}
				className="h-10 w-full rounded-md border-2 border-white/10 bg-white/10 pr-8 pl-2 outline-none placeholder:text-gray-400 lg:cursor-pointer lg:transition-shadow lg:duration-300 lg:hover:shadow-[0_0_15px_#ffffff]/15"
				onChange={(e) => setSearchValue(e.currentTarget.value)}
				placeholder="Título ou palavra-chave"
			/>
			<img
				src={`/assets/images/icons/${searchValue ? 'cancel' : 'search'}.png`}
				alt={searchValue ? 'Cancelar' : 'Pesquisar'}
				className="absolute top-1/2 -right-1 -translate-x-1/2 -translate-y-1/2 lg:cursor-pointer"
				onClick={() => setSearchValue('')}
			/>
		</div>
	);
}
