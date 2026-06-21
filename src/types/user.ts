// * Tipos de dados utilizados para trabalhar com o Firebase.

export interface UserData {
	id: string;
	email: string;
	name: string;
	lastname: string | null;
	birthDate: string | null;
	picture: string | null;
	createdAt: Date;
	supporter: boolean;
	savedTips: string[];
}

export interface UserProgress {
	inProgressModule: string;
	inProgressTopic: string;
	inProgressSubtopic: string;
	doneModules: string[];
	doneTopics: string[];
	doneSubtopics: string[];
}

interface NavigationItem {
	currentTopic: string;
	currentSubtopic: string;
}

export type UserNavigation = Record<number, NavigationItem>;
