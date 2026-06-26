import { Outlet } from 'react-router-dom';
import { DashboardNavbar } from '../components/DashboardNavbar';

export function Dashboard() {
	return (
		<div className="flex w-full items-center justify-center">
			<div className="relative my-[120px] flex justify-center">
				<DashboardNavbar />
				<div className="min-h-screen w-[700px] rounded-md rounded-tl-none bg-[#241f49]/80 p-10 shadow-[0_0_20px_#ffffff]/10">
					<Outlet />
				</div>
			</div>
		</div>
	);
}
