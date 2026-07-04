import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { useSafeContext } from '../hooks/useSafeContext';
import { AuthContext } from '../contexts/AuthProvider/context';
import type { Middleware } from '../types/middlewares';
import { LoadingPage } from '../pages/LoadingPage';

type GuardProps = {
	middlewares: Middleware[];
};

export function ProtectedRoute({ middlewares }: GuardProps) {
	const { authState } = useSafeContext(AuthContext);
	const { moduleId } = useParams();
	const location = useLocation();
	const state = location.state as { initialModuleSlug: string };

	const context = {
		user: authState,
		moduleId: moduleId || null,
		initialModuleSlug: state?.initialModuleSlug || null,
	};

	const results = middlewares.map((middleware) => middleware(context));

	for (const res of results) {
		if (res.pending) return <LoadingPage />;
		if (!res.passed) return <Navigate to={res.redirectTo!} replace />;
	}

	return <Outlet />;
}
