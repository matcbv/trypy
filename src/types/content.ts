import type { Document } from '@contentful/rich-text-types';
import type { Themes } from '../constants/themeStyle';

export type SubtopicTypes = 'lesson' | 'exercise' | 'resolution' | 'conclusion';

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
	videoDescription?: string;
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
