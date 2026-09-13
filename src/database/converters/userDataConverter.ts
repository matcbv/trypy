import {
	type FirestoreDataConverter,
	type WithFieldValue,
	QueryDocumentSnapshot,
	Timestamp,
} from 'firebase/firestore';
import type { UserData } from '../../types/user';

type FirestoreUserData = Omit<UserData, 'createdAt'> & { createdAt: Timestamp };

export const userDataConverter: FirestoreDataConverter<UserData> = {
	toFirestore(userData: WithFieldValue<UserData>) {
		return userData;
	},

	fromFirestore(snapshot: QueryDocumentSnapshot) {
		const data = snapshot.data() as FirestoreUserData;

		return {
			...data,
			createdAt: data.createdAt.toDate(),
		};
	},
};
