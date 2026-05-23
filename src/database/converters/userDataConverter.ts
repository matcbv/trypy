import {
	type FirestoreDataConverter,
	type WithFieldValue,
	QueryDocumentSnapshot,
} from 'firebase/firestore';
import type { UserData } from '../../types/user';

export const userDataConverter: FirestoreDataConverter<UserData> = {
	toFirestore(userData: WithFieldValue<UserData>) {
		return userData;
	},

	fromFirestore(snapshot: QueryDocumentSnapshot) {
		return snapshot.data() as UserData;
	},
};
