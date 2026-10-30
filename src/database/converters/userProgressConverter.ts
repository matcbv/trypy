import {
	type FirestoreDataConverter,
	type WithFieldValue,
	QueryDocumentSnapshot,
	Timestamp,
} from 'firebase/firestore';
import type { ProgressState } from '../../types/states';

type FirestoreUserData = Omit<ProgressState, 'createdAt'> & {
	lastActivityAt: Timestamp;
};

export const userProgressConverter: FirestoreDataConverter<ProgressState> = {
	toFirestore(userProgress: WithFieldValue<ProgressState>) {
		return userProgress;
	},

	fromFirestore(snapshot: QueryDocumentSnapshot) {
		const data = snapshot.data() as FirestoreUserData;
		return {
			...data,
			lastActivityAt: data.lastActivityAt ? data.lastActivityAt.toDate() : null,
		};
	},
};
