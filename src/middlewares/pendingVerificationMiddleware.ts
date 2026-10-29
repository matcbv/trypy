import type { Middleware } from '../types/middlewares';

export const pendingVerificationMiddleware: Middleware = ({ user }) => {
	if (!user) return { passed: false, redirectTo: '/session' };
	if (user.emailVerified) return { passed: false, redirectTo: '/dashboard' };
	return { passed: true };
};
