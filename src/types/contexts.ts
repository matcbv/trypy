import type { Dispatch, SetStateAction } from 'react';
import type authActionTypes from '../contexts/AuthProvider/actionTypes';
import type {
	AuthState,
	NavigationState,
	ProgressState,
	TerminalState,
} from './states';
import type { UserData } from './user';

export interface AuthContextType {
	authState: AuthState;
	authDispatch: Dispatch<{
		type: keyof typeof authActionTypes;
		payload?: Partial<Omit<AuthState, 'data'>> & { data?: Partial<UserData> };
	}>;
}

export interface ProgressContextType {
	progressState: ProgressState;
	setProgressState: Dispatch<SetStateAction<ProgressState>>;
}

export interface NavigationContextType {
	navigationState: NavigationState;
	setNavigationState: Dispatch<SetStateAction<NavigationState>>;
}

export interface RunCodeParams {
	userCode: string;
	testCode: string | null;
	expectedOutput: string | null;
}

export interface TerminalContextType {
	terminalState: TerminalState;
	setTerminalState: Dispatch<SetStateAction<TerminalState>>;
	runCode: (params: RunCodeParams) => void;
	stopCodeExecution: () => void;
}
