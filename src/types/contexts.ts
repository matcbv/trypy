import type { Dispatch, SetStateAction } from 'react';
import type authActionTypes from '../contexts/AuthProvider/actionTypes';
import type progressActionTypes from '../contexts/ProgressProvider/actionTypes';
import type navigationActionTypes from '../contexts/NavigationProvider/actionTypes';
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
	progressDispatch: Dispatch<{
		type: keyof typeof progressActionTypes;
		payload?: Partial<ProgressState>;
	}>;
}

export interface NavigationContextType {
	navigationState: NavigationState;
	navigationDispatch: Dispatch<{
		type: keyof typeof navigationActionTypes;
		payload: Partial<NavigationState>;
	}>;
}

export interface TerminalContextType {
	terminalState: TerminalState;
	setTerminalState: Dispatch<SetStateAction<TerminalState>>;
	runCode: (code: string) => void;
	stopCodeExecution: () => void;
}
