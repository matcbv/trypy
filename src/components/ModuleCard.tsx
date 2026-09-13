import { Link, useNavigate } from 'react-router-dom';
import { ProgressContext } from '../contexts/ProgressProvider/context';
import { useSafeContext } from '../hooks/useSafeContext';
import type { ModuleCardData } from '../types/content';
import type { MouseEvent } from 'react';
import { AuthContext } from '../contexts/AuthProvider/context';
import { logInfo } from '../utils/logger';
import { ContentfulContentContext } from '../contexts/ContentfulContentProvider/context';

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
	const { modules } = useSafeContext(ContentfulContentContext);

	const isModuleBlocked =
		!progressState.doneModules.includes(card.moduleId) &&
		progressState.inProgressModule !== card.moduleId &&
		modules?.[0]!.slug !== card.moduleId;

	const CheckModuleAccess = ({ event, moduleId }: CheckModuleAccessProps) => {
		if (isModuleBlocked) {
			event.preventDefault();
			logInfo('Complete o módulo anterior para liberar o acesso.');
			return;
		}
		if (!authState.uid && moduleId !== initialModuleSlug) {
			event.preventDefault();
			logInfo('Faça login ou crie uma conta para acessar o módulo.');
			void navigate('/session');
		}
	};

	return (
		<div
			key={card.title}
			className="relative flex min-h-[460px] max-w-[460px] overflow-hidden rounded-md bg-[url('/assets/images/batthern-background.png')] shadow-[0_0_30px_#000000]/50"
		>
			<div className="bg-module-background/80 flex flex-col">
				<h2 className="flex gap-x-[12px] rounded-t-md border-b border-(--theme-color) p-[20px]">
					{card.title}
					{progressState.doneModules.includes(card.moduleId) && (
						<img src="/assets/images/icons/done.png" alt="Concluído" />
					)}
				</h2>
				<div className="flex flex-1 flex-col justify-between text-sm">
					<div className="p-5">
						<p className="mb-6 leading-6">{card.description}</p>
						<div>
							<p className="mb-4">Tópicos desse módulo:</p>
							<ul className="ml-4 flex list-disc flex-col items-start gap-y-2 marker:text-(--theme-color)">
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
						className={`group relative mb-7 flex h-10 items-center border-y border-y-gray-200 bg-black/20 py-1 transition-all duration-300 ${!isModuleBlocked && 'lg:hover:bg-(--theme-color)/70 lg:hover:shadow-[0_0_15px_var(--shadow-theme-color)]'}`}
						onClick={(e) =>
							CheckModuleAccess({ event: e, moduleId: card.moduleId })
						}
					>
						<p
							className={`absolute left-[40px] flex items-center gap-x-3 transition-all duration-300 ${!isModuleBlocked && 'lg:group-hover:left-[302px]'}`}
						>
							{isModuleBlocked && (
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
