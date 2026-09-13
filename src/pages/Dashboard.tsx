import { Outlet } from 'react-router-dom';
import { DashboardNavbar } from '../components/DashboardNavbar';

export function Dashboard() {
	return (
		<div className="flex w-full items-center justify-center">
			<div className="relative my-30 flex w-full justify-center">
				<DashboardNavbar />
				<div className="bg-dashboard-background min-h-screen w-[min(600px,100%)] rounded-md p-10 shadow-[0_0_20px_#ffffff]/10 lg:rounded-tl-none">
					<Outlet />
				</div>
			</div>
		</div>
	);
}
