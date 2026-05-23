import {
	type FirestoreDataConverter,
	type WithFieldValue,
	QueryDocumentSnapshot,
} from 'firebase/firestore';
import type { UserProgress } from '../../types/user';

export const userProgressConverter: FirestoreDataConverter<UserProgress> = {
	toFirestore(userProgress: WithFieldValue<UserProgress>) {
		return userProgress;
	},

	fromFirestore(snapshot: QueryDocumentSnapshot) {
		return snapshot.data() as UserProgress;
	},
};
