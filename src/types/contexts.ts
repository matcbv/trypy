import type { Dispatch, SetStateAction } from 'react';
import type {
	AuthState,
	NavigationState,
	ProgressState,
	TerminalState,
} from './states';
import type { ModuleCardData, ModuleData } from './content';
import type { ErrorContentType } from '../contexts/ContentfulContentProvider';

export interface AuthContextType {
	authState: AuthState;
	setAuthState: Dispatch<SetStateAction<AuthState>>;
}

export interface ContentfulContentContextType {
	modules: ModuleData[] | null;
	moduleCards: ModuleCardData[] | null;
	isLoading: {
		modules: boolean;
		moduleCards: boolean;
	};
	errorData: ErrorContentType;
	refreshModules: () => Promise<void>;
	refreshModuleCards: () => Promise<void>;
}

export interface ProgressContextType {
	progressState: ProgressState;
	setProgressState: Dispatch<SetStateAction<ProgressState>>;
}

export interface NavigationContextType {
	navigationState: NavigationState | null;
	setNavigationState: Dispatch<SetStateAction<NavigationState | null>>;
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
