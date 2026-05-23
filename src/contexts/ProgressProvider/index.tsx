import { useEffect, useReducer, type ReactNode } from 'react';
import initialState from './initialState';
import { ProgressContext } from './context';
import reducer from './reducer';
import { getDoc, setDoc } from 'firebase/firestore';
import { auth } from '../../database/configs/firebase';
import actionTypes from './actionTypes';
import { onAuthStateChanged } from 'firebase/auth';
import { userProgressRef } from '../../database/refs/userRefs';

export default function ProgressProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [progressState, progressDispatch] = useReducer(reducer, initialState);

	useEffect(() => {
		onAuthStateChanged(auth, (user) => {
			void (async () => {
				if (user) {
					const progress = await getDoc(userProgressRef(user.uid));
					if (progress.exists()) {
						progressDispatch({
							type: actionTypes.SET_PROGRESS,
							payload: progress.data(),
						});
					} else {
						await setDoc(userProgressRef(user.uid), initialState);
					}
				} else {
					progressDispatch({
						type: actionTypes.RESET_PROGRESS,
					});
				}
			})();
		});
	}, []);

	return (
		<ProgressContext value={{ progressState, progressDispatch }}>
			{children}
		</ProgressContext>
	);
}
