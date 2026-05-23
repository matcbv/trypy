import type { NavigationState } from '../../types/states';
import actionTypes from './actionTypes';

export default function reducer(
	state: NavigationState,
	{
		type,
		payload,
	}: { type: keyof typeof actionTypes; payload: Partial<NavigationState> },
) {
	switch (type) {
		case actionTypes.SET_CURRENT_PROGRESS:
			return { ...state, ...payload };
	}
}
