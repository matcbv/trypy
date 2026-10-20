import { signOut } from 'firebase/auth';
import { auth } from '../../database/configs/firebase';
import { removeNavigationStorage } from '../storage/navigationStorage';
import { removeProgressStorage } from '../storage/progressStorage';

export async function signOutAndClear() {
	removeNavigationStorage();
	removeProgressStorage();
	await signOut(auth);
}
