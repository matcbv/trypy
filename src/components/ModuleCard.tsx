import { Link } from 'react-router-dom';
import { ProgressContext } from '../contexts/ProgressProvider/context';
import { useSafeContext } from '../hooks/useSafeContext';
import type { ModuleCardData } from '../types/content';

export function ModuleCard({ card }: { card: ModuleCardData }) {
	const { progressState } = useSafeContext(ProgressContext);

	const isModuleBlocked =
		!progressState.doneModules.includes(card.moduleId) &&
		progressState.inProgressModule !== card.moduleId;

	return (
		<div
			key={card.title}
			className="relative z-20 h-[460px] w-[467px] overflow-hidden rounded-md bg-[url('/assets/images/batthern.png')] shadow-[0_0_20px_#000000a1]"
		>
			<div className="flex h-full w-full flex-col bg-[#0f0d16dc]">
				<h2 className="flex gap-x-3 rounded-t-md border-b border-[var(--cardColor)] p-5">
					{card.title}
					{progressState.doneModules.includes(card.moduleId) && (
						<img src="/assets/images/icons/done.png" alt="Concluído" />
					)}
				</h2>
				<div className="flex flex-1 flex-col justify-between">
					<div className="p-5 text-sm">
						<p className="mb-6 leading-relaxed">{card.description}</p>
						<div>
							<p className="mb-4">Tópicos desse módulo:</p>
							<ul className="ml-4 flex list-disc flex-col items-start gap-y-2 marker:text-[var(--cardColor)]">
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
						className={`group relative mb-7 flex h-10 items-center border-y bg-black/20 py-1 transition-all duration-300 ${isModuleBlocked ? 'cursor-not-allowed' : 'hover:bg-[var(--slideButtonColor)] hover:shadow-[0_0_10px_var(--slideButtonColor)]'}`}
						onClick={(e) => isModuleBlocked && e.preventDefault()}
					>
						<p
							className={`absolute left-10 flex items-center gap-x-3 text-white transition-all duration-300 ${!isModuleBlocked && 'group-hover:left-[292px]'}`}
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
