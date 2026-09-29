import { signOut } from 'firebase/auth';
import { auth } from '../database/configs/firebase';
import { removeNavigationStorage } from './navigationStorage';
import { removeProgressStorage } from './progressStorage';

export async function signOutAndClear() {
	removeNavigationStorage();
	removeProgressStorage();
	await signOut(auth);
}
