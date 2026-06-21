import { doc } from 'firebase/firestore';
import { db } from '../configs/firebase';
import { userProgressConverter } from '../converters/userProgressConverter';
import { userDataConverter } from '../converters/userDataConverter';
import { userNavigationConverter } from '../converters/userNavigationConverter';

export const userDataRef = (uid: string) => {
	return doc(db, 'users', uid).withConverter(userDataConverter);
};

export const userProgressRef = (uid: string) => {
	return doc(db, 'userProgress', uid).withConverter(userProgressConverter);
};

export const userNavigationRef = (uid: string) => {
	return doc(db, 'userNavigation', uid).withConverter(userNavigationConverter);
};
