import { useEffect, useState, type ReactNode } from 'react';
import initialState from './initialState';
import { ProgressContext } from './context';
import { getDoc, setDoc } from 'firebase/firestore';
import { auth } from '../../database/configs/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { userProgressRef } from '../../database/refs/userRefs';

export default function ProgressProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [progressState, setProgressState] = useState(initialState);

	useEffect(() => {
		onAuthStateChanged(auth, (user) => {
			void (async () => {
				if (user) {
					const progress = await getDoc(userProgressRef(user.uid));
					if (progress.exists()) {
						setProgressState((prev) => ({ ...prev, ...progress.data() }));
					} else {
						await setDoc(userProgressRef(user.uid), initialState);
					}
				} else {
					setProgressState(initialState);
				}
			})();
		});
	}, []);

	return (
		<ProgressContext value={{ progressState, setProgressState }}>
			{children}
		</ProgressContext>
	);
}
