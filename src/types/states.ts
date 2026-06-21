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

interface NavigationItem {
	currentTopic: string;
	currentSubtopic: string;
}

export type NavigationState = Record<number, NavigationItem>;

export interface TerminalState {
	status: 'idle' | 'loading' | 'ready' | 'running' | 'error';
	output: string | null;
	error: string | null;
}
