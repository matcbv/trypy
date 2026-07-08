import { useEffect, useState } from 'react';
import { ProgressContext } from '../contexts/ProgressProvider/context';
import { AuthContext } from '../contexts/AuthProvider/context';
import { fetchContent } from '../content/services/fetchContent';
import { ProgressBar } from '../components/ProgressBar';
import { logError } from '../utils/logger';
import { useSafeContext } from '../hooks/useSafeContext';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { Timestamp } from 'firebase/firestore';

export function UserOverview() {
	const { authState } = useSafeContext(AuthContext);
	const { progressState } = useSafeContext(ProgressContext);
	const [titles, setTitles] = useState({
		module: '',
		topic: '',
		subtopic: '',
	});
	const [isCopied, setIsCopied] = useState(false);

	const accountDate = () => {
		const { createdAt } = authState.data!;

		if (createdAt && createdAt instanceof Timestamp) {
			return new Date(createdAt.toDate()).toLocaleDateString('pt-br');
		}

		return <SkeletonLoader height={18} width={85} />;
	};

	useEffect(() => {
		void (async () => {
			try {
				const [module, topic, subtopic] = await Promise.all([
					fetchContent({
						contentType: 'module',
						include: 0,
						slug: progressState.inProgressModule,
					}),
					fetchContent({
						contentType: 'topic',
						include: 0,
						slug: progressState.inProgressTopic,
					}),
					fetchContent({
						contentType: 'subtopic',
						include: 0,
						slug: progressState.inProgressSubtopic,
					}),
				]);
				setTitles({
					module: module[0]!.fields.title,
					topic: topic[0]!.fields.title,
					subtopic: subtopic[0]!.fields.title,
				});
			} catch (error) {
				logError({
					error,
					text: 'Não foi possível calcular seu progresso. Tente novamente ou fale conosco.',
				});
			}
		})();
	}, [
		progressState.inProgressModule,
		progressState.inProgressTopic,
		progressState.inProgressSubtopic,
	]);

	const copyText = async (text: string) => {
		await navigator.clipboard.writeText(text);
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
				<h2 className="mb-2 text-xl">Dados da conta:</h2>
				<div className="flex w-1/2 flex-col gap-y-2 rounded-md bg-black/40 p-4 shadow-[0_0_20px_#000000]/50">
					<p className="flex gap-x-2">
						ID de usuário:
						<span
							className="group hover:text-main-purple relative flex cursor-pointer items-center transition-colors"
							onClick={(e) =>
								void copyText(e.currentTarget.textContent.replace('#', ''))
							}
							onMouseLeave={() => setTimeout(() => setIsCopied(false), 100)}
						>
							<span className="text-main-purple mr-0.5">#</span>
							{authState.data?.id}
							<img
								src={`/assets/images/icons/${isCopied ? 'success' : 'copy'}.png`}
								alt="Copiar"
								className="ml-1 w-4 origin-left scale-0 cursor-pointer transition-transform group-hover:scale-100"
							/>
						</span>
					</p>
					<p className="flex items-center gap-x-1">
						Criada em: <span>{accountDate()}</span>
					</p>
					<p>
						Apoiador(a):{' '}
						<span className="ml-1">
							{authState.data?.supporter ? 'Sim' : 'Não'}
						</span>
					</p>
				</div>
			</div>
			<div>
				<h2 className="mb-2 text-2xl tracking-wide">Progresso da trilha</h2>
				<div className="flex items-center gap-x-10 rounded-md bg-black/40 p-8 shadow-[0_0_20px_#000000]/50">
					<ProgressBar />
					<div className="flex flex-col gap-y-5">
						<p className="flex flex-col gap-y-1">
							Módulo atual:{' '}
							<span className="cursor-pointer font-bold text-[#29bd5f]">
								{titles.module || <SkeletonLoader height={24} width={270} />}
							</span>
						</p>
						<p className="flex flex-col gap-y-1">
							Tópico atual:{' '}
							<span className="cursor-pointer font-bold text-[#29bd5f]">
								{titles.topic || <SkeletonLoader height={24} width={270} />}
							</span>
						</p>
						<p className="flex flex-col gap-y-1">
							Subtópico atual:{' '}
							<span className="cursor-pointer font-bold text-[#29bd5f]">
								{titles.subtopic || <SkeletonLoader height={24} width={270} />}
							</span>
						</p>
					</div>
				</div>
			</div>
			<div>
				<h2 className="mb-2 text-2xl">Conquistas</h2>
				<div className="flex items-center gap-x-2 rounded-md bg-black/40 p-8 shadow-[0_0_20px_#000000]/50">
					<img src="/assets/images/icons/loading.png" alt="Carregando" />
					<p className="text-xl">Em produção...</p>
				</div>
			</div>
		</div>
	);
}
