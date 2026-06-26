import type { Middleware } from '../types/middlewares';

export const guestMiddleware: Middleware = (context) => {
	if (context.user.loading) {
		return {
			pending: true,
		};
	}
	if (context.user.data) {
		return {
			pending: false,
			passed: false,
			redirectTo: '/dashboard',
		};
	}
	return {
		pending: false,
		passed: true,
	};
};
