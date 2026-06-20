import type { UserData } from './user';

export interface AuthState {
	uid: string | null;
	data: Partial<UserData> | null;
	loading: boolean;
}

export interface ProgressState {
	inProgressModule: string;
	inProgressTopic: string;
	inProgressSubtopic: string;
	doneModules: string[];
	doneTopics: string[];
	doneSubtopics: string[];
}

export interface NavigationState {
	currentModule: string;
	currentTopic: string;
	currentSubtopic: string;
	isLastSubtopic: boolean;
	isHydrated: boolean;
}

export interface TerminalState {
	status: 'idle' | 'loading' | 'ready' | 'running' | 'error';
	output: string | null;
	error: string | null;
}
