import type { TerminalState } from './states';

export interface WorkerRequest {
	type: 'init' | 'run';
	userCode?: string;
	testCode?: string;
}

export interface WorkerResponse {
	type: 'stdout' | 'stderr' | 'status' | 'error';
	status?: TerminalState['status'];
	data?: string;
	error?: string;
}
