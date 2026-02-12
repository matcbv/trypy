import actionTypes from './actionTypes';
import initialState from './initialState';

export default function reducer(state, { type, payload }) {
	switch (type) {
		case actionTypes.SET_PROGRESS:
			return { ...state, ...payload };
		case actionTypes.RESET_PROGRESS:
			return initialState;
	}
}
