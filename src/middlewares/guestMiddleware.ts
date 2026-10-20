import type { Middleware } from '../types/middlewares';

export const guestMiddleware: Middleware = ({ user }) => {
	if (user?.emailVerified) return { passed: false, redirectTo: '/dashboard' };

	if (user) return { passed: false, redirectTo: '/verify-email' };

	return { passed: true };
};
