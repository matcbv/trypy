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
import { Module } from '../pages/Module';
import { Support } from '../pages/Support';
import { ResetPassword } from '../pages/ResetPassword';
import { UserOverview } from '../pages/UserOverview';

// Providers
import { NavigationProvider } from '../contexts/NavigationProvider';
import { AuthProvider } from '../contexts/AuthProvider';
import { ProgressProvider } from '../contexts/ProgressProvider';
import { authMiddleware } from '../middlewares/authMiddleware';
import { ProtectedRoute } from './ProtectedRoute';
import { TerminalProvider } from '../contexts/TerminalProvider';
import { AboutUs } from '../pages/AboutUs';
import { BeAPartner } from '../pages/BeAPartner';
import { ScrollToTop } from '../components/ScrollToTop';
import { guestMiddleware } from '../middlewares/guestMiddleware';
import { SupportUs } from '../pages/SupportUs';

export function AppRoutes() {
	return (
		<BrowserRouter>
			<ScrollToTop />
			<AuthProvider>
				<ProgressProvider>
					<NavigationProvider>
						<Routes>
							<Route element={<BaseLayout />}>
								<Route path="/" element={<Home />} />
								<Route
									element={<ProtectedRoute middlewares={[guestMiddleware]} />}
								>
									<Route path="/session" element={<Session />} />
									<Route path="/register" element={<Register />} />
								</Route>
								<Route
									element={<ProtectedRoute middlewares={[authMiddleware]} />}
								>
									<Route path="/dashboard" element={<Dashboard />}>
										<Route index element={<UserOverview />} />
										<Route path="profile" element={<EditProfile />} />
										<Route path="support-us" element={<SupportUs />} />
										<Route path="certifications" element={<Certifications />} />
										<Route path="resolutions" element={<Resolutions />} />
									</Route>
									<Route element={<TerminalProvider />}>
										<Route
											path="/learning-path/:moduleId"
											element={<Module />}
										/>
									</Route>
								</Route>
								<Route path="/learning-path" element={<LearningPath />} />
								<Route path="/reset-password" element={<ResetPassword />} />
								<Route path="/support" element={<Support />} />
								<Route path="/about-us" element={<AboutUs />} />
								<Route path="/be-a-partner" element={<BeAPartner />} />
							</Route>
						</Routes>
					</NavigationProvider>
				</ProgressProvider>
			</AuthProvider>
		</BrowserRouter>
	);
}
