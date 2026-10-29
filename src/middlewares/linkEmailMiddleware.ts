import type { Middleware } from '../types/middlewares';

export const linkEmailMiddleware: Middleware = ({ user }) => {
	if (!user) {
		return { passed: false, redirectTo: '/session' };
	}

	if (user.emailVerified) {
		return { passed: false, redirectTo: '/dashboard' };
	}

	const hasPasswordProvider = user.providerData.some(
		(provider) => provider.providerId === 'password',
	);

	if (!hasPasswordProvider) {
		return {
			passed: false,
			redirectTo: '/dashboard/account-and-security',
		};
	}

	return { passed: true };
};
