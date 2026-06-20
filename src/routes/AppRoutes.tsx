import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Pages
import { BaseLayout } from '../layouts/BaseLayout';
import { Home } from '../pages/Home';
import { Session } from '../pages/Session';
import { Register } from '../pages/Register';
import { LearningPath } from '../pages/LearningPath';
import { Dashboard } from '../pages/Dashboard';
import { EditProfile } from '../pages/EditProfile';
import { Certifications } from '../pages/Certifications';
import { Resolutions } from '../pages/Resolutions';
import { Tips } from '../pages/Tips';
import { Module } from '../pages/Module';
import { Support } from '../pages/Support';
import { ResetPassword } from '../pages/ResetPassword';
import { UserOverview } from '../pages/UserOverview';

// Providers
import { NavigationProvider } from '../contexts/NavigationProvider';
import AuthProvider from '../contexts/AuthProvider';
import ProgressProvider from '../contexts/ProgressProvider';
import { authMiddleware } from '../middlewares/authMiddleware';
import { ProtectedRoute } from './ProtectedRoute';
import { TerminalProvier } from '../contexts/TerminalProvider';

export function AppRoutes() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<ProgressProvider>
					<Routes>
						<Route element={<BaseLayout />}>
							<Route path="/" element={<Home />} />
							<Route path="/session" element={<Session />} />
							<Route path="/register" element={<Register />} />
							<Route
								element={<ProtectedRoute middlewares={[authMiddleware]} />}
							>
								<Route path="/dashboard" element={<Dashboard />}>
									<Route index element={<UserOverview />} />
									<Route path="profile" element={<EditProfile />} />
									<Route path="certifications" element={<Certifications />} />
									<Route path="resolutions" element={<Resolutions />} />
									<Route path="tips" element={<Tips />} />
								</Route>
							</Route>

							<Route element={<NavigationProvider />}>
								<Route path="/learning-path" element={<LearningPath />} />
								<Route
									element={<ProtectedRoute middlewares={[authMiddleware]} />}
								>
									<Route element={<TerminalProvier />}>
										<Route
											path="/learning-path/:moduleId"
											element={<Module />}
										/>
									</Route>
								</Route>
							</Route>
							<Route path="/support" element={<Support />} />
							<Route path="/reset-password" element={<ResetPassword />} />
						</Route>
					</Routes>
				</ProgressProvider>
			</AuthProvider>
		</BrowserRouter>
	);
}
