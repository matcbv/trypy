import type { Document } from '@contentful/rich-text-types';
import type { Themes } from '../constants/themeStyle';

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
	videoDescription: string | null;
	videoLink: string | null;
	slug: string;
	order: number;
	isExercise: boolean;
	solutionCode: string | null;
	testCode: string | null;
	starterCode: string | null;
	expectedOutput: string | null;
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
