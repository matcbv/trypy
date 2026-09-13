import {
	type FirestoreDataConverter,
	type WithFieldValue,
	QueryDocumentSnapshot,
} from 'firebase/firestore';
import type { NavigationState } from '../../types/states';

export const userNavigationConverter: FirestoreDataConverter<NavigationState> =
	{
		toFirestore(userNavigation: WithFieldValue<NavigationState>) {
			return userNavigation;
		},

		fromFirestore(snapshot: QueryDocumentSnapshot) {
			return snapshot.data();
		},
	};
