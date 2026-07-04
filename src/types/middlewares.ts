import type { AuthState } from './states';

export interface MiddlewareContext {
	user: AuthState;
	moduleId: string | null;
	initialModuleSlug: string | null;
}

export interface MiddlewareResponse {
	pending: boolean;
	passed?: boolean;
	redirectTo?: string;
}

export type Middleware = (context: MiddlewareContext) => MiddlewareResponse;
