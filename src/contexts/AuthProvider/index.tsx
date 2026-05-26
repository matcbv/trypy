import { auth } from '../../database/configs/firebase';
import { useEffect, useReducer, type ReactNode } from 'react';
import initialState from './initialState';
import reducer from './reducer';
import { AuthContext } from './context';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import actionTypes from './actionTypes';
import { getDoc } from 'firebase/firestore';
import { userDataRef } from '../../database/refs/userRefs';
import { logError } from '../../utils/logger';

export default function AuthProvider({ children }: { children: ReactNode }) {
	const [authState, authDispatch] = useReducer(reducer, initialState);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			void (async () => {
				try {
					if (user) {
						const userData = await getDoc(userDataRef(user.uid));

						if (!userData.exists()) return;

						authDispatch({
							type: actionTypes.SET_DATA,
							payload: {
								uid: user.uid,
								data: userData.data(),
							},
						});
					} else {
						authDispatch({ type: actionTypes.LOGOUT });
					}
				} catch (error) {
					await signOut(auth);
					logError(
						error,
						'Ocorreu um erro ao renovar a sessão. Faça login novamente.',
					);
				}
			})();
		});

		return unsubscribe;
	}, []);

	return (
		<AuthContext value={{ authState, authDispatch }}>{children}</AuthContext>
	);
}
