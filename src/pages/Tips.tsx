import { useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthProvider/context';
import { TipPy } from '../components/TipPy';
import { fetchContent } from '../content/services/fetchContent';
import { useSafeContext } from '../hooks/useSafeContext';
import type { TipData } from '../types/content';
import { logError } from '../utils/logger';

export function Tips() {
	const { authState } = useSafeContext(AuthContext);
	const [tips, setTips] = useState<TipData[]>([]);

	useEffect(() => {
		void (async () => {
			if (!authState.data?.savedTips) return;

			try {
				const tips = await Promise.all(
					authState.data.savedTips.map(async (slug) => {
						const res = await fetchContent({
							contentType: 'tipPy',
							include: 0,
							orderOrSlug: slug,
						});

						if (!res[0])
							throw new Error(`Não foi possível obter a dica ${slug}`);

						return res[0].fields;
					}),
				);
				setTips(tips);
			} catch (error) {
				logError(
					error,
					'Não foi possível carregar suas dicas salvas. Tente novamente ou fale conosco.',
				);
			}
		})();
	}, [authState.data?.savedTips]);

	return (
		<div>
			<h1 className="mb-10 text-3xl font-bold tracking-wide">Dicas salvas</h1>
			{tips.length > 0 ? (
				<div className="flex flex-col items-center justify-center gap-y-5">
					{tips.map((tip) => (
						<TipPy tipFields={tip} />
					))}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center gap-y-5 opacity-60">
					<div className="rounded-full bg-[radial-gradient(circle,_#594486e3,_transparent_70%)]">
						<img
							src="/assets/images/favorites.png"
							alt="Certificação"
							draggable="false"
							className="h-[300px] w-[300px]"
						/>
					</div>

					<p className="text-2xl select-none text-shadow-[0_0_15px_#624b93e3]">
						Nenhuma dica salva
					</p>
				</div>
			)}
		</div>
	);
}
