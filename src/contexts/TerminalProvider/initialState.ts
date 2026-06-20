import type { TerminalState } from '../../types/states';

const initialState = {
	status: 'idle',
	output: null,
	error: null,
} as TerminalState;

export default initialState;
