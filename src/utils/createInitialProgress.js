import { doc, setDoc } from 'firebase/firestore';
import { fetchInitialContent } from '../content/fetchInitialContent';
import initialStateProgress from '../contexts/ProgressProvider/initialState';
import { db } from '../database/firebase';

export async function createInitialProgress(uid) {
	const { initialModule, initialTopic, initialSubtopic } =
		await fetchInitialContent();

	const progressData = {
		...initialStateProgress,
		inProgressModule: initialModule,
		inProgressTopic: initialTopic,
		inProgressSubtopic: initialSubtopic,
	};

	await setDoc(doc(db, 'userProgress', uid), progressData);

	return progressData;
}
