import { useContext, useEffect, useState } from 'react';
import ProgressContext from '../contexts/ProgressProvider/context';
import UserContext from '../contexts/AuthProvider/context';
import { fetchContent } from '../content/fetchContent';
import { ProgressBar } from '../components/ProgressBar';

export function UserOverview() {
	const [authData] = useContext(UserContext);
	const [progressData] = useContext(ProgressContext);
	const [titles, setTitles] = useState({});
	const [isCopied, setIsCopied] = useState(false);

	useEffect(() => {
		[
			{ type: 'module', slug: progressData.currentModule },
			{ type: 'topic', slug: progressData.currentTopic },
			{ type: 'subtopic', slug: progressData.currentSubtopic },
		].forEach(async (obj) => {
			if (!obj.slug) return;

			const res = await fetchContent(obj.type, 0, obj.slug);
			setTitles((prev) => ({ ...prev, [obj.type]: res[0].fields.title }));
		});
	}, [
		progressData.currentModule,
		progressData.currentTopic,
		progressData.currentSubtopic,
	]);

	const copyText = async (text) => {
		await navigator.clipboard.writeText(text.replace('#', ''));
		setIsCopied((prev) => !prev);
		setTimeout(() => {
			setIsCopied(false);
		}, 2000);
	};

	return (
		<div className="flex flex-col gap-y-12">
			<div>
				<h1 className="mb-8 text-3xl font-bold">Olá, {authData.data?.name}!</h1>
				<h2 className="mb-2 text-lg">Dados da conta:</h2>
				<div className="flex w-1/2 flex-col gap-y-2 rounded-md bg-black/40 p-4 shadow-[0_0_10px_#0000009c]">
					<p className="flex gap-x-2">
						ID de usuário:
						<span
							className="group relative flex cursor-pointer items-center transition-colors hover:text-[var(--main-purple)]"
							onClick={(e) => copyText(e.currentTarget.textContent)}
							onMouseLeave={() => setTimeout(() => setIsCopied(false), 100)}
						>
							<span className="mr-0.5 text-[var(--main-purple)]">#</span>
							{authData.data?.id}
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
				<div className="flex items-center gap-x-10 rounded-md bg-black/40 p-8 shadow-[0_0_15px_#0000009c] ring ring-[var(--main-green)]/60">
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
				<div className="flex items-center gap-x-1 rounded-md bg-black/40 p-8 shadow-[0_0_15px_#0000009c] ring ring-[var(--main-purple)]/60">
					<img src="/assets/images/icons/loading.png" alt="Carregando" />
					<p className="text-xl">Em produção...</p>
				</div>
			</div>
		</div>
	);
}
