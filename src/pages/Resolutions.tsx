/* eslint-disable camelcase */

import { AuthContext } from '../contexts/AuthProvider/context';
import { useSafeContext } from '../hooks/useSafeContext';
import { ResolutionCard } from '../components/ResolutionCard';

export function Resolutions() {
	const { authState } = useSafeContext(AuthContext);

	return (
		<div>
			<h1 className="mb-[40px] text-2xl font-bold tracking-wide">
				Exercícios resolvidos
			</h1>
			{authState.data && Object.keys(authState.data.resolutions!).length > 0 ? (
				<div className="flex flex-col gap-y-[20px]">
					{authState.data.resolutions!.map(({ slug, title, code }) => (
						<ResolutionCard key={slug} slug={slug} title={title} code={code} />
					))}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center gap-y-5 opacity-60">
					<div className="rounded-full bg-[radial-gradient(circle,#594486,transparent_70%)]">
						<img
							src="/assets/images/resolutions.png"
							alt="Resolução"
							draggable="false"
							className="w-account-img"
						/>
					</div>

					<p className="text-section-xl select-none text-shadow-[0_0_15px_#624b93]">
						Nenhum exercício resolvido
					</p>
				</div>
			)}
		</div>
	);
}
