import {
	type FirestoreDataConverter,
	type WithFieldValue,
	QueryDocumentSnapshot,
} from 'firebase/firestore';
import type { ProgressState } from '../../types/states';

export const userProgressConverter: FirestoreDataConverter<ProgressState> = {
	toFirestore(userProgress: WithFieldValue<ProgressState>) {
		return userProgress;
	},

	fromFirestore(snapshot: QueryDocumentSnapshot) {
		return snapshot.data() as ProgressState;
	},
};
