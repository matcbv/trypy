import { useEffect, useReducer } from 'react';
import initialState from './initialState';
import { ProgressContext } from './context';
import reducer from './reducer';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../database/firebase';
import actionTypes from './actionTypes';
import { onAuthStateChanged } from 'firebase/auth';

export default function ProgressProvider({ children }) {
	const [progressState, progressDispatch] = useReducer(reducer, initialState);

	useEffect(() => {
		onAuthStateChanged(auth, async (user) => {
			if (user) {
				const progress = await getDoc(doc(db, 'userProgress', user.uid));
				if (progress.exists()) {
					progressDispatch({
						type: actionTypes.SET_PROGRESS,
						payload: progress.data(),
					});
				} else {
					setDoc(doc(db, 'userProgress', user.uid), initialState);
				}
			} else {
				progressDispatch({
					type: actionTypes.RESET_PROGRESS,
				});
			}
		});
	}, []);

	return (
		<ProgressContext value={{ progressState, progressDispatch }}>
			{children}
		</ProgressContext>
	);
}
