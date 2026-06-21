import {
	type FirestoreDataConverter,
	type WithFieldValue,
	QueryDocumentSnapshot,
} from 'firebase/firestore';
import type { UserNavigation } from '../../types/user';

export const userNavigationConverter: FirestoreDataConverter<UserNavigation> = {
	toFirestore(userData: WithFieldValue<UserNavigation>) {
		return userData;
	},

	fromFirestore(snapshot: QueryDocumentSnapshot) {
		return snapshot.data();
	},
};
