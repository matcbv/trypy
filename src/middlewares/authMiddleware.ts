import type { Middleware } from '../types/middlewares';

export const authMiddleware: Middleware = ({
	user,
	moduleId,
	initialModuleSlug,
}) => {
	if (user?.emailVerified) return { passed: true };

	if (moduleId && moduleId === initialModuleSlug) return { passed: true };

	return { passed: false, redirectTo: user ? '/verify-email' : '/' };
};
