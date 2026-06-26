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
import { useNavigate } from 'react-router-dom';

export default function AuthProvider({ children }: { children: ReactNode }) {
	const [authState, authDispatch] = useReducer(reducer, initialState);
	const navigate = useNavigate();

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			void (async () => {
				authDispatch({
					type: actionTypes.SET_DATA,
					payload: { loading: true },
				});
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
					void navigate('/', { replace: true });
					logError(
						error,
						'Não foi possível renovar a sessão. Faça login novamente.',
					);
				} finally {
					authDispatch({
						type: actionTypes.SET_DATA,
						payload: { loading: false },
					});
				}
			})();
		});

		return unsubscribe;
	}, [navigate]);

	return (
		<AuthContext value={{ authState, authDispatch }}>{children}</AuthContext>
	);
}
