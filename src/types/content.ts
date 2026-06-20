import type { Document } from '@contentful/rich-text-types';

export interface ModuleData {
	title: string;
	topics: TopicData[];
	slug: string;
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
	videoDescription: string;
	videoLink: string;
	slug: string;
	order: number;
	isExercise: boolean;
}

export interface ModuleCardData {
	title: string;
	description: string;
	topicsList: string[];
	theme: string;
	moduleId: string;
	order: number;
}

export interface TipData {
	title: string;
	content: Document;
	slug: string;
	order: number;
}
