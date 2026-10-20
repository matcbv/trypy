import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../database/configs/firebase';
import { signOutAndClear } from '../services/auth/signOutAndClear';
import { DisplayableError } from '../classes/DisplayableError';

export function useRequireUser() {
	const navigate = useNavigate();

	return useCallback(async () => {
		await auth.authStateReady();

		const { currentUser } = auth;
		if (!currentUser) {
			await signOutAndClear();
			void navigate('/', { replace: true });
			throw new DisplayableError(
				'Sua sessão expirou. Faça login novamente para continuar.',
			);
		}

		return currentUser;
	}, [navigate]);
}
