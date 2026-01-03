import actionTypes from './actionTypes';
import authData from './data';

export default function reducer(state, { type, payload }) {
	switch (type) {
		case actionTypes.SET_DATA:
			return {
				...state,
				...payload,
			};
		case actionTypes.LOGOUT:
			return authData;
	}
}
