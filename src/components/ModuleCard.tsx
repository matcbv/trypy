import { Link, useNavigate } from 'react-router-dom';
import { ProgressContext } from '../contexts/ProgressProvider/context';
import { useSafeContext } from '../hooks/useSafeContext';
import type { ModuleCardData } from '../types/content';
import type { MouseEvent } from 'react';
import { toast } from 'react-toastify';
import type { ToastData } from '../types/toast';
import { ToastNotification } from './Notifications';
import { AuthContext } from '../contexts/AuthProvider/context';

interface ModuleCardProps {
	card: ModuleCardData;
	initialModuleSlug: string;
}

interface CheckModuleAccessProps {
	event: MouseEvent<HTMLAnchorElement>;
	moduleId: string;
}

export function ModuleCard({ card, initialModuleSlug }: ModuleCardProps) {
	const navigate = useNavigate();
	const { progressState } = useSafeContext(ProgressContext);
	const { authState } = useSafeContext(AuthContext);

	const isModuleBlocked = (moduleId: string) => {
		if (authState.uid) {
			return (
				!progressState.doneModules.includes(card.moduleId) &&
				progressState.inProgressModule !== card.moduleId
			);
		}

		return initialModuleSlug !== moduleId;
	};

	const CheckModuleAccess = ({ event, moduleId }: CheckModuleAccessProps) => {
		if (isModuleBlocked(moduleId)) {
			if (!authState.uid) {
				event.preventDefault();
				toast<ToastData>(ToastNotification, {
					type: 'info',
					data: {
						type: 'info',
						text: 'Faça login ou crie uma conta para acessar o módulo.',
					},
				});
				void navigate('/session');
				return;
			}
			event.preventDefault();
			toast<ToastData>(ToastNotification, {
				type: 'info',
				data: {
					type: 'info',
					text: 'Complete o módulo anterior para liberar o acesso.',
				},
			});
		}
	};

	return (
		<div
			key={card.title}
			className="relative size-[460px] overflow-hidden rounded-md bg-[url('/assets/images/batthern.png')] shadow-[0_0_30px_#000000]/50"
		>
			<div className="flex size-full flex-col bg-[#0f0d16dc]">
				<h2 className="flex gap-x-3 rounded-t-md border-b border-(--card-color) p-5">
					{card.title}
					{progressState.doneModules.includes(card.moduleId) && (
						<img src="/assets/images/icons/done.png" alt="Concluído" />
					)}
				</h2>
				<div className="flex flex-1 flex-col justify-between">
					<div className="p-5 text-sm">
						<p className="mb-6 leading-6">{card.description}</p>
						<div>
							<p className="mb-4">Tópicos desse módulo:</p>
							<ul className="ml-4 flex list-disc flex-col items-start gap-y-2 marker:text-(--card-color)">
								{card.topicsList?.map((topic) => (
									<li className="bg-black/30 p-1" key={topic}>
										{topic}
									</li>
								))}
							</ul>
						</div>
					</div>
					<Link
						to={`/learning-path/${card.moduleId}`}
						state={{ initialModuleSlug }}
						className={`group relative mb-7 flex h-10 items-center border-y bg-black/20 py-1 transition-all duration-300 ${isModuleBlocked(card.moduleId) ? 'cursor-not-allowed' : 'hover:bg-(--slide-button-color) hover:shadow-[0_0_10px_var(--slide-button-color)]'}`}
						onClick={(e) =>
							CheckModuleAccess({ event: e, moduleId: card.moduleId })
						}
					>
						<p
							className={`absolute left-10 flex items-center gap-x-3 text-white transition-all duration-300 ${!isModuleBlocked(card.moduleId) && 'group-hover:left-[292px]'}`}
						>
							{isModuleBlocked(card.moduleId) && (
								<img src="/assets/images/icons/locked.png" alt="Bloqueado" />
							)}
							Acessar módulo
						</p>
					</Link>
				</div>
			</div>
		</div>
	);
}
