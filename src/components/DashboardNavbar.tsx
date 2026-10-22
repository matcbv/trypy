import { Link, useNavigate } from 'react-router-dom';
import { logError, logSuccess } from '../utils/logger';
import { signOutAndClear } from '../services/auth/signOutAndClear';

const objectsMap = [
	{ slug: '', title: 'Visão geral', icon: 'user-overview' },
	{ slug: 'edit-profile', title: 'Editar dados', icon: 'edit-profile' },
	{ slug: 'resolutions', title: 'Resoluções', icon: 'resolution' },
	{ slug: 'certifications', title: 'Certificações', icon: 'certificate' },
	{ slug: 'support-us', title: 'Apoie-nos', icon: 'support-us' },
	{ slug: 'account-and-security', title: 'Conta e segurança', icon: 'account' },
];

export function DashboardNavbar() {
	const navigate = useNavigate();

	const logoutWrapper = async () => {
		try {
			await signOutAndClear();
			void navigate('/', { replace: true });
			logSuccess('Você foi deslogado com sucesso!');
		} catch (error) {
			logError({ error, text: 'Falha ao deslogar. Tente novamente.' });
		}
	};

	return (
		<div className="h-fit overflow-hidden rounded-l-md shadow-[0_0_20px_#ffffff]/10">
			<ul className="hidden flex-col lg:flex">
				{objectsMap.map((object) => (
					<li key={object.title}>
						<Link
							to={`/dashboard/${object.slug}`}
							className="block bg-white/10 px-6 py-5 hover:bg-[radial-gradient(ellipse,transparent,#ffffff1a)]"
						>
							<div className="flex w-full gap-x-2">
								<img
									alt="Ícone"
									src={`/assets/images/icons/${object.icon}.png`}
									className="hidden lg:inline"
								/>
								{object.title}
							</div>
						</Link>
					</li>
				))}
				<li>
					<button
						type="button"
						className="flex w-full cursor-pointer bg-white/10 px-6 py-5 hover:bg-[radial-gradient(ellipse,transparent,#ff00001a)]"
						onClick={() => void logoutWrapper()}
					>
						<div className="flex w-full max-w-[130px] gap-x-2">
							<img
								src="/assets/images/icons/logout.png"
								alt="Deslogar"
								className="hidden w-6 lg:inline"
							/>
							Deslogar
						</div>
					</button>
				</li>
			</ul>
		</div>
	);
}
