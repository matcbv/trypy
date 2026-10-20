import type { User } from 'firebase/auth';

export interface MiddlewareContext {
	user: User | null;
	moduleId: string | null;
	initialModuleSlug: string | null;
}

export type MiddlewareResponse =
	{ passed: true } | { passed: false; redirectTo: string };

export type Middleware = (context: MiddlewareContext) => MiddlewareResponse;
