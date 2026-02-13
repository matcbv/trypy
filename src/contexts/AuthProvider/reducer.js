import actionTypes from './actionTypes';
import initialState from './initialState';

export default function reducer(state, { type, payload }) {
	switch (type) {
		case actionTypes.SET_DATA:
			return {
				...state,
				...payload,
				data: { ...state.data, ...payload.data },
			};
		case actionTypes.LOGOUT:
			return initialState;
	}
}
