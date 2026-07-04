import type { Middleware } from '../types/middlewares';

export const authMiddleware: Middleware = (context) => {
	if (context.user.loading) {
		return {
			pending: true,
		};
	}
	if (!context.user.uid) {
		if (context.moduleId && context.moduleId === context.initialModuleSlug) {
			return {
				pending: false,
				passed: true,
			};
		}

		return {
			pending: false,
			passed: false,
			redirectTo: '/session',
		};
	}
	return {
		pending: false,
		passed: true,
	};
};
