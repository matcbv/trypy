import { useEffect, useReducer } from 'react';
import data from './data';
import ProgressContext from './context';
import reducer from './reducer';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../database/firebase';
import actionTypes from './actionTypes';
import { onAuthStateChanged } from 'firebase/auth';

export default function ProgressProvider({ children }) {
	const [progressData, progressDispatch] = useReducer(reducer, data);

	useEffect(() => {
		onAuthStateChanged(auth, async (user) => {
			if (user) {
				const progress = await getDoc(doc(db, 'userProgress', user.uid));
				progressDispatch({
					type: actionTypes.SET_PROGRESS,
					payload: progress.data(),
				});
			} else {
				progressDispatch({
					type: actionTypes.CLEAR_PROGRESS,
				});
			}
		});
	}, []);

	return (
		<ProgressContext value={[progressData, progressDispatch]}>
			{children}
		</ProgressContext>
	);
}
