import actionTypes from './actionTypes';

export default function reducer(state, { type, payload }) {
	switch (type) {
		case actionTypes.SET_CURRENT_PROGRESS:
			return { ...state, ...payload };
		case actionTypes.SET_IS_LAST_SUBTOPIC:
			return { ...state, isLastSubtopic: payload };
	}
}
