import type { AuthState } from '../../types/states';
import type { UserData } from '../../types/user';
import actionTypes from './actionTypes';
import initialState from './initialState';

export default function reducer(
	state: AuthState,
	{
		type,
		payload,
	}: {
		type: keyof typeof actionTypes;
		payload?: Partial<Omit<AuthState, 'data'>> & { data?: Partial<UserData> };
	},
) {
	switch (type) {
		case actionTypes.SET_DATA:
			return {
				...state,
				...payload,
				data: payload?.data ? { ...state.data, ...payload?.data } : state.data,
			};
		case actionTypes.LOGOUT:
			return initialState;
	}
}
