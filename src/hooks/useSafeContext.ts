import { useContext, type Context } from 'react';

export function useSafeContext<T>(context: Context<T | null>): T {
	const safeContext = useContext(context);
	if (!safeContext) {
		throw new Error(
			`${context.displayName} deve ser utilizado dentro de seu Provider.`,
		);
	}
	return safeContext;
}
