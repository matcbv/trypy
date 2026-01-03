import actionTypes from './actionTypes';
import progressData from './data';

export default function reducer(state, { type, payload }) {
	switch (type) {
		case actionTypes.SET_PROGRESS:
			return { ...state, ...payload };
		case actionTypes.CLEAR_PROGRESS:
			return progressData;
	}
}
