import { auth, db } from '../../database/firebase.js';
import { useEffect, useReducer } from 'react';
import data from './data';
import reducer from './reducer';
import AuthContext from './context';
import { onAuthStateChanged } from 'firebase/auth';
import actionTypes from './actionTypes.js';
import { doc, getDoc } from 'firebase/firestore';

export default function AuthProvider({ children }) {
	const [authData, authDispatch] = useReducer(reducer, data);

	useEffect(() => {
		onAuthStateChanged(auth, async (user) => {
			if (user) {
				const userData = await getDoc(doc(db, 'users', user.uid));
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
		});
	}, []);

	return (
		<AuthContext.Provider value={[authData, authDispatch]}>
			{children}
		</AuthContext.Provider>
	);
}
