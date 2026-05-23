import { useEffect, useState } from 'react';
import { ProgressContext } from '../contexts/ProgressProvider/context';
import { AuthContext } from '../contexts/AuthProvider/context';
import { fetchContent } from '../content/services/fetchContent';
import { ProgressBar } from '../components/ProgressBar';
import { logError } from '../utils/logger';
import { useSafeContext } from '../hooks/useSafeContext';

export function UserOverview() {
	const { authState } = useSafeContext(AuthContext);
	const { progressState } = useSafeContext(ProgressContext);
	const [titles, setTitles] = useState({
		module: '',
		topic: '',
		subtopic: '',
	});
	const [isCopied, setIsCopied] = useState(false);

	useEffect(() => {
		void (async () => {
			try {
				const [module, topic, subtopic] = await Promise.all([
					fetchContent({
						contentType: 'module',
						include: 0,
						orderOrSlug: progressState.inProgressModule,
					}),
					fetchContent({
						contentType: 'topic',
						include: 0,
						orderOrSlug: progressState.inProgressTopic,
					}),
					fetchContent({
						contentType: 'subtopic',
						include: 0,
						orderOrSlug: progressState.inProgressSubtopic,
					}),
				]);
				setTitles({
					module: module[0]?.fields.title || 'Nenhum módulo concluído',
					topic: topic[0]?.fields.title || 'Nenhum tópico concluído',
					subtopic: subtopic[0]?.fields.title || 'Nenhum subtópico concluído',
				});
			} catch (error) {
				logError(
					error,
					'Não foi possível calcular seu progresso. Tente novamente ou fale conosco.',
				);
			}
		})();
	}, [
		progressState.inProgressModule,
		progressState.inProgressTopic,
		progressState.inProgressSubtopic,
	]);

	const copyText = async (text: string) => {
		await navigator.clipboard.writeText(text.replace('#', ''));
		setIsCopied((prev) => !prev);
		setTimeout(() => {
			setIsCopied(false);
		}, 2000);
	};

	return (
		<div className="flex flex-col gap-y-12">
			<div>
				<h1 className="mb-8 text-3xl font-bold">
					Olá, {authState.data?.name}!
				</h1>
				<h2 className="mb-2 text-lg">Dados da conta:</h2>
				<div className="flex w-1/2 flex-col gap-y-2 rounded-md bg-black/40 p-4 shadow-[0_0_10px_#0000009c]">
					<p className="flex gap-x-2">
						ID de usuário:
						<span
							className="group relative flex cursor-pointer items-center transition-colors hover:text-[var(--main-purple)]"
							onClick={(e) => void copyText(e.currentTarget.textContent)}
							onMouseLeave={() => setTimeout(() => setIsCopied(false), 100)}
						>
							<span className="mr-0.5 text-[var(--main-purple)]">#</span>
							{authState.data?.id}
							<img
								src={`/assets/images/icons/${isCopied ? 'success' : 'copy'}.png`}
								alt="Copiar"
								className="ml-1 w-4 origin-left scale-0 cursor-pointer transition-transform group-hover:scale-100"
							/>
						</span>
					</p>
					<p>
						Criada em: <span className="ml-1">23/10/2025</span>
					</p>
					<p>
						Apoiador(a): <span className="ml-1">Não</span>
					</p>
				</div>
			</div>
			<div>
				<h2 className="mb-4 text-2xl tracking-wide">Progresso da trilha</h2>
				<div className="flex items-center gap-x-10 rounded-md bg-black/40 p-8 shadow-[0_0_15px_#0000009c]">
					<ProgressBar />
					<div className="flex flex-col gap-y-5">
						<p className="flex flex-col gap-y-1">
							Módulo atual:{' '}
							<span className="cursor-pointer font-bold text-[#29bd5f]">
								{titles.module}
							</span>
						</p>
						<p className="flex flex-col gap-y-1">
							Tópico atual:{' '}
							<span className="cursor-pointer font-bold text-[#29bd5f]">
								{titles.topic}
							</span>
						</p>
						<p className="flex flex-col gap-y-1">
							Subtópico atual:{' '}
							<span className="cursor-pointer font-bold text-[#29bd5f]">
								{titles.subtopic}
							</span>
						</p>
					</div>
				</div>
			</div>
			<div>
				<h2 className="mb-4 text-2xl">Conquistas</h2>
				<div className="flex items-center gap-x-1 rounded-md bg-black/40 p-8 shadow-[0_0_15px_#0000009c]">
					<img src="/assets/images/icons/loading.png" alt="Carregando" />
					<p className="text-xl">Em produção...</p>
				</div>
			</div>
		</div>
	);
}
