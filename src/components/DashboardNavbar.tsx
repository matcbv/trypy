import { Link, useNavigate } from 'react-router-dom';
import { logError, logSuccess } from '../utils/logger';
import { ProgressContext } from '../contexts/ProgressProvider/context';
import { NavigationContext } from '../contexts/NavigationProvider/context';
import { useSafeContext } from '../hooks/useSafeContext';
import { AuthContext } from '../contexts/AuthProvider/context';
import { logout } from '../database/auth/auth';

export function DashboardNavbar() {
	const navigate = useNavigate();
	const { authDispatch } = useSafeContext(AuthContext);
	const { setProgressState } = useSafeContext(ProgressContext);
	const { setNavigationState } = useSafeContext(NavigationContext);

	const objectsMap = [
		{ slug: '', title: 'Visão geral', icon: 'user-overview' },
		{ slug: 'profile', title: 'Editar conta', icon: 'edit-account' },
		{ slug: 'support-us', title: 'Apoie-nos', icon: 'support-us' },
		{ slug: 'certifications', title: 'Certificações', icon: 'certificate' },
		{ slug: 'resolutions', title: 'Resoluções', icon: 'resolution' },
	];

	const logoutWrapper = async () => {
		try {
			await logout({ authDispatch, setProgressState, setNavigationState });
			void navigate('/', { replace: true });
			logSuccess('Você foi deslogado com sucesso!');
		} catch (error) {
			logError({ error, text: 'Falha ao deslogar. Tente novamente.' });
		}
	};

	return (
		<div className="h-fit w-[200px] overflow-hidden rounded-l-md shadow-[0_0_20px_#ffffff]/10">
			<ul className="flex flex-col">
				{objectsMap.map((object) => (
					<li key={object.title}>
						<Link
							to={`/dashboard/${object.slug}`}
							className="flex w-full cursor-pointer justify-center bg-white/5 hover:bg-[radial-gradient(ellipse,transparent,#ffffff1a)]"
						>
							<div className="flex w-[141px] gap-x-3 py-5">
								<img
									alt="Ícone"
									src={`/assets/images/icons/${object.icon}.png`}
								/>
								{object.title}
							</div>
						</Link>
					</li>
				))}
				<li>
					<button
						type="button"
						className="flex w-full cursor-pointer justify-center bg-white/5 py-5 hover:bg-[radial-gradient(ellipse,transparent,#ff00001a)]"
						onClick={() => void logoutWrapper()}
					>
						<div className="flex w-[137px] gap-x-3">
							<img src="/assets/images/icons/logout.png" alt="Deslogar" />
							Deslogar
						</div>
					</button>
				</li>
			</ul>
		</div>
	);
}
