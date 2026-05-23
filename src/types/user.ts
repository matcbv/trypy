// * Tipos de dados utilizados para trabalhar com o Firebase.

export interface UserData {
	id: string;
	email: string;
	name: string;
	lastname: string | null;
	birthDate: string | null;
	picture: string | null;
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
