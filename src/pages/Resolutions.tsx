/* eslint-disable camelcase */

import { AuthContext } from '../contexts/AuthProvider/context';
import { useSafeContext } from '../hooks/useSafeContext';
import { ResolutionCard } from '../components/ResolutionCard';

export function Resolutions() {
	const { authState } = useSafeContext(AuthContext);

	return (
		<div>
			<h1 className="mb-10 text-3xl font-bold tracking-wide">
				Exercícios resolvidos
			</h1>
			{authState.data && Object.keys(authState.data.resolutions!).length > 0 ? (
				Object.entries(authState.data.resolutions!).map(
					([slug, { title, code }]) => (
						<ResolutionCard key={slug} slug={slug} title={title} code={code} />
					),
				)
			) : (
				<div className="flex flex-col items-center justify-center gap-y-5 opacity-60">
					<div className="rounded-full bg-[radial-gradient(circle,_#594486,_transparent_70%)]">
						<img
							src="/assets/images/resolutions.png"
							alt="Resolução"
							draggable="false"
							className="h-[300px] w-[300px]"
						/>
					</div>

					<p className="text-2xl select-none text-shadow-[0_0_15px_#624b93]">
						Nenhum exercício resolvido
					</p>
				</div>
			)}
		</div>
	);
}
