import { useMemo } from 'react';
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

	return (
		<div className="flex flex-col gap-y-10">
			<div>
				<h1 className="mb-2 text-2xl font-bold">
					Olá, {authState.data?.name}!
				</h1>
				<p>Continue sua jornada de aprendizado em Python.</p>
			</div>
			<div>
				<h2 className="mb-2 text-lg font-bold">Progresso da trilha</h2>
				<div className="flex flex-col items-center justify-center gap-y-6 rounded-md bg-black/40 p-5 outline outline-black sm:flex-row sm:gap-x-6">
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
		</div>
	);
}
