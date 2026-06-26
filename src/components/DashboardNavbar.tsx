import { signOut } from 'firebase/auth';
import { auth } from '../database/configs/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ToastNotification } from '../components/Notifications';
import { logError } from '../utils/logger';
import type { ToastData } from '../types/toast';
import { storageKeys } from '../constants/storageKeys';

export function DashboardNavbar() {
	const navigate = useNavigate();

	const objectsMap = [
		{ slug: '', title: 'Visão geral', icon: 'user-overview' },
		{ slug: 'profile', title: 'Editar conta', icon: 'edit-account' },
		{ slug: 'certifications', title: 'Certificações', icon: 'certificate' },
		{ slug: 'resolutions', title: 'Resoluções', icon: 'resolution' },
		{ slug: 'tips', title: 'Dicas salvas', icon: 'tip' },
	];

	const logout = async () => {
		try {
			await signOut(auth);

			localStorage.removeItem(storageKeys.NAVIGATION_STATE);

			void navigate('/', { replace: true });

			toast<ToastData>(ToastNotification, {
				type: 'success',
				data: {
					type: 'success',
					text: 'Você foi deslogado com sucesso!',
				},
			});
		} catch (error) {
			logError(error, 'Falha ao deslogar. Tente novamente.');
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
						onClick={() => void logout()}
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
