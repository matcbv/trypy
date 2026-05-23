import type { ProgressState } from '../../types/states';
import actionTypes from './actionTypes';
import initialState from './initialState';

export default function reducer(
	state: ProgressState,
	{
		type,
		payload,
	}: { type: keyof typeof actionTypes; payload?: Partial<ProgressState> },
) {
	switch (type) {
		case actionTypes.SET_PROGRESS:
			return { ...state, ...payload };
		case actionTypes.RESET_PROGRESS:
			return initialState;
	}
}
