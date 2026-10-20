import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import type { Middleware } from '../types/middlewares';
import { LoadingPage } from '../pages/LoadingPage';
import { auth } from '../database/configs/firebase';
import { useSafeContext } from '../hooks/useSafeContext';
import { AuthContext } from '../contexts/AuthProvider/context';

type GuardProps = {
	middlewares: Middleware[];
};

export function ProtectedRoute({ middlewares }: GuardProps) {
	const { currentUser } = auth;
	const { authState } = useSafeContext(AuthContext);
	const { moduleId } = useParams();
	const location = useLocation();
	const state = location.state as { initialModuleSlug: string };

	if (authState.loading) return <LoadingPage />;

	const context = {
		user: currentUser,
		moduleId: moduleId || null,
		initialModuleSlug: state?.initialModuleSlug || null,
	};

	for (const middleware of middlewares) {
		const res = middleware(context);
		if (!res.passed) return <Navigate to={res.redirectTo} replace />;
	}

	return <Outlet />;
}
