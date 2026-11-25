import type { Document } from '@contentful/rich-text-types';
import type { Themes } from '../constants/themeStyle';
import type { ResolvedAsset } from './richText';

export type SubtopicTypes =
	'lesson' | 'videolesson' | 'exercise' | 'resolution' | 'conclusion';

export interface ModuleData {
	title: string;
	topics: TopicData[];
	slug: string;
	theme: Themes;
	order: number;
}

export interface TopicData {
	title: string;
	subtopics: SubtopicData[];
	slug: string;
	order: number;
}

export interface SubtopicData {
	title: string;
	content: Document;
	videoDescription?: Document;
	videoLink?: string;
	slug: string;
	order: number;
	subtopicType: SubtopicTypes;
	solutionCode?: string;
	testCode?: string;
	starterCode?: string;
	expectedOutput?: string;
}

export interface ModuleCardData {
	title: string;
	description: string;
	topicsList: string[];
	theme: Themes;
	moduleId: string;
	order: number;
}

export interface TipData {
	title: string;
	content: Document;
	slug: string;
	order: number;
}

export interface FaqCategory {
	name: string;
	description: string;
	questions: FaqQuestion[];
	icon: ResolvedAsset;
	slug: string;
	order: number;
}

export interface FaqQuestion {
	question: string;
	answer: Document;
	order: number;
}
