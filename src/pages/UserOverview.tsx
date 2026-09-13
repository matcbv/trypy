import { useMemo, useState } from 'react';
import { ProgressContext } from '../contexts/ProgressProvider/context';
import { AuthContext } from '../contexts/AuthProvider/context';
import { ProgressBar } from '../components/ProgressBar';
import { useSafeContext } from '../hooks/useSafeContext';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { ContentfulContentContext } from '../contexts/ContentfulContentProvider/context';

export function UserOverview() {
	const { authState } = useSafeContext(AuthContext);
	const { modules } = useSafeContext(ContentfulContentContext);
	const { progressState } = useSafeContext(ProgressContext);
	const [isCopied, setIsCopied] = useState(false);

	const accountDate = useMemo(() => {
		if (!authState.data) {
			return <SkeletonLoader height={24} width={85} />;
		}

		return authState.data.createdAt.toLocaleDateString('pt-br');
	}, [authState.data]);

	const currentProgress = useMemo(() => {
		if (!modules) return null;

		const module =
			modules.find(
				(module) => module.slug === progressState.inProgressModule,
			) ?? null;
		const topic =
			module?.topics.find(
				(topic) => topic.slug === progressState.inProgressTopic,
			) ?? null;
		const subtopic =
			topic?.subtopics.find(
				(subtopic) => subtopic.slug === progressState.inProgressSubtopic,
			) ?? null;

		return { module, topic, subtopic };
	}, [
		modules,
		progressState.inProgressModule,
		progressState.inProgressTopic,
		progressState.inProgressSubtopic,
	]);

	const titles = useMemo(
		() => ({
			module: currentProgress?.module?.title,
			topic: currentProgress?.topic?.title,
			subtopic: currentProgress?.subtopic?.title,
		}),
		[currentProgress],
	);

	const progressPercentual = useMemo(() => {
		if (!modules) return 0;

		const subtopicsLength = modules.flatMap((module) =>
			module.topics.flatMap((topic) => topic.subtopics),
		).length;

		const percentual =
			(progressState.doneSubtopics.length * 100) / subtopicsLength;
		const roundedPercentual = Math.round(Number(percentual.toFixed(2)));

		return roundedPercentual;
	}, [modules, progressState.doneSubtopics.length]);

	const copyText = async (text: string) => {
		await navigator.clipboard.writeText(text);
		setIsCopied((prev) => !prev);
		setTimeout(() => {
			setIsCopied(false);
		}, 2000);
	};

	return (
		<div className="flex flex-col gap-y-[40px]">
			<div>
				<h1 className="mb-8 text-2xl font-bold">
					Olá, {authState.data?.name}!
				</h1>
				<h2 className="mb-2 text-lg">Dados da conta:</h2>
				<div className="flex flex-col items-start gap-y-2 rounded-md bg-black/40 p-[15px] shadow-[0_0_20px_#000000]/50 sm:max-w-[300px]">
					<div className="group relative flex items-center">
						<p className="flex gap-x-2">
							ID de usuário:
							<span
								className="lg:hover:text-main-purple lg:cursor-pointer lg:transition-colors"
								onClick={(e) =>
									void copyText(e.currentTarget.textContent.replace('#', ''))
								}
								onMouseLeave={() => setIsCopied(false)}
							>
								<span className="text-main-purple mr-0.5">#</span>
								{authState.data?.id}
							</span>
						</p>
						<img
							src={`/assets/images/icons/${isCopied ? 'success' : 'copy'}.png`}
							alt="Copiar"
							tabIndex={0}
							role="button"
							className="absolute -right-6 w-[18px] origin-left lg:scale-0 lg:cursor-pointer lg:transition-transform lg:group-hover:scale-100"
							onClick={(e) =>
								void copyText(e.currentTarget.textContent.replace('#', ''))
							}
						/>
					</div>

					<p className="flex items-center gap-x-1">
						Criada em: <span>{accountDate}</span>
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
				<h2 className="mb-2 text-lg tracking-wide">Progresso da trilha</h2>
				<div className="flex flex-col items-center justify-center gap-y-[25px] rounded-md bg-black/40 p-[25px] shadow-[0_0_20px_#000000]/50 sm:flex-row sm:gap-x-[25px] sm:gap-y-0">
					<ProgressBar progressPercentual={progressPercentual} />
					<div className="flex flex-col gap-y-5">
						<p className="flex flex-col">
							Módulo atual:{' '}
							<span className="text-progress-titles font-bold">
								{titles.module || <SkeletonLoader height={24} width={250} />}
							</span>
						</p>
						<p className="flex flex-col">
							Tópico atual:{' '}
							<span className="text-progress-titles font-bold">
								{titles.topic || <SkeletonLoader height={24} width={250} />}
							</span>
						</p>
						<p className="flex flex-col">
							Subtópico atual:{' '}
							<span className="text-progress-titles font-bold">
								{titles.subtopic || <SkeletonLoader height={24} width={250} />}
							</span>
						</p>
					</div>
				</div>
			</div>
			<div>
				<h2 className="mb-2 text-lg">Conquistas</h2>
				<div className="flex items-center gap-x-2 rounded-md bg-black/40 p-8 shadow-[0_0_20px_#000000]/50">
					<img src="/assets/images/icons/loading.png" alt="Carregando" />
					<p className="text-lg">Em produção...</p>
				</div>
			</div>
		</div>
	);
}
