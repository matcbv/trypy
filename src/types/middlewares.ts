import type { AuthState } from './states';

export interface MiddlewareContext {
	user: AuthState;
}

export interface MiddlewareResponse {
	pending: boolean;
	passed?: boolean;
	redirectTo?: string;
}

export type Middleware = (context: MiddlewareContext) => MiddlewareResponse;
