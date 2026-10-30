import { useMemo } from 'react';
import { ProgressContext } from '../contexts/ProgressProvider/context';
import { AuthContext } from '../contexts/AuthProvider/context';
import { ProgressBar } from '../components/ProgressBar';
import { useSafeContext } from '../hooks/useSafeContext';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { ContentfulContentContext } from '../contexts/ContentfulContentProvider/context';
import type { SubtopicTypes } from '../types/content';
import { NavigationContext } from '../contexts/NavigationProvider/context';
import { useNavigate } from 'react-router-dom';

const MILLISECONDS_IN_A_DAY = 1000 * 60 * 60 * 24;

export function UserOverview() {
	const { authState } = useSafeContext(AuthContext);
	const { modules } = useSafeContext(ContentfulContentContext);
	const { progressState } = useSafeContext(ProgressContext);
	const { navigationState, setNavigationState } =
		useSafeContext(NavigationContext);
	const navigate = useNavigate();

	function formatLastActivity(date: Date): string {
		const now = new Date();

		const today = new Date(now);
		today.setHours(0, 0, 0, 0);

		const activityDate = new Date(date);
		activityDate.setHours(0, 0, 0, 0);

		const daysSinceLastActivity = Math.floor(
			(today.getTime() - activityDate.getTime()) / MILLISECONDS_IN_A_DAY,
		);

		if (daysSinceLastActivity === 0) return 'Hoje';
		if (daysSinceLastActivity === 1) return 'Ontem';

		const formatter = new Intl.RelativeTimeFormat('pt-BR', {
			numeric: 'always',
		});

		if (daysSinceLastActivity < 7) {
			return formatter.format(-daysSinceLastActivity, 'day');
		}

		if (daysSinceLastActivity < 30) {
			return formatter.format(-Math.floor(daysSinceLastActivity / 7), 'week');
		}

		if (daysSinceLastActivity < 365) {
			return formatter.format(-Math.floor(daysSinceLastActivity / 30), 'month');
		}

		return formatter.format(-Math.floor(daysSinceLastActivity / 365), 'year');
	}

	const getLastDoneSubtopic = (subtopicSlug: string) => {
		return modules
			?.flatMap(({ topics }) => topics.flatMap(({ subtopics }) => subtopics))
			.find(({ slug }) => slug === subtopicSlug)?.title;
	};

	const getSubtopicsFromType = (type: SubtopicTypes) => {
		return modules?.flatMap(({ topics }) =>
			topics.flatMap(({ subtopics }) =>
				subtopics
					.filter((subtopic) => subtopic.subtopicType === type)
					.map(({ slug }) => slug),
			),
		);
	};

	const exercises = getSubtopicsFromType('exercise');
	const doneExercises = progressState.doneSubtopics.filter((subtopic) =>
		exercises?.includes(subtopic),
	);
	const videolessons = getSubtopicsFromType('videolesson');
	const doneVideolessons = progressState.doneSubtopics.filter((subtopic) =>
		videolessons?.includes(subtopic),
	);
	const lastDoneSubtopicSlug = progressState.doneSubtopics.at(-1);
	const lastDoneSubtopic = lastDoneSubtopicSlug
		? getLastDoneSubtopic(lastDoneSubtopicSlug)
		: 'Nenhuma atividade concluída';

	const navigateToCurrentSubtopic = () => {
		if (!navigationState) return;

		setNavigationState((prev) => ({
			...prev,
			[progressState.inProgressModule]: {
				currentTopic: progressState.inProgressTopic,
				currentSubtopic: progressState.inProgressSubtopic,
			},
		}));
		void navigate(`/learning-path/${progressState.inProgressModule}`);
	};

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
		<div>
			<div className="mb-10">
				<h1 className="mb-2 text-2xl font-bold">
					Olá, {authState.data?.name}!
				</h1>
				<p>Continue sua jornada de aprendizado em Python.</p>
			</div>
			<div className="mb-5">
				<h2 className="mb-2 flex items-center gap-x-2 text-lg font-bold">
					<img src="/assets/images/icons/progress.png" alt="Progresso" />
					Progresso da trilha
				</h2>
				<div className="mb-5 flex flex-col justify-center gap-y-6 rounded-md bg-black/40 p-5 outline outline-black sm:gap-x-6">
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
					<button
						type="button"
						onClick={navigateToCurrentSubtopic}
						className="form-btn text-section-base font-bold"
					>
						Continuar de onde parei
					</button>
				</div>
			</div>
			<div className="mb-5 flex flex-col gap-5 lg:flex-row">
				<div className="flex flex-1 flex-col items-start gap-y-3 rounded-md bg-black/40 p-5 font-bold outline outline-black">
					<img src="/assets/images/icons/code.png" alt="Código" />
					<span className="text-title-2xl text-main-purple">
						{exercises ? (
							doneExercises.length + '/' + exercises.length
						) : (
							<SkeletonLoader width={50} height={30} />
						)}
					</span>
					<p>Exercícios concluídos</p>
				</div>
				<div className="flex flex-1 flex-col items-start gap-y-3 rounded-md bg-black/40 p-5 font-bold outline outline-black">
					<img src="/assets/images/icons/videolesson.png" alt="Videoaula" />
					<span className="text-title-2xl text-main-cyan">
						{doneVideolessons.length}/{videolessons?.length ?? 0}
					</span>
					<p>Videoaulas assistidas</p>
				</div>
			</div>
			<div className="relative rounded-md bg-black/40 p-5 outline outline-black">
				<div>
					<h2 className="text-section-base mb-3 flex items-center gap-x-2 rounded-md font-bold">
						<img src="/assets/images/icons/clock.png" alt="Relógio" />
						Última atividade
					</h2>
					<p className="text-section-lg flex gap-x-2">
						<span className="text-main-purple font-bold">{'>>>'}</span>
						{lastDoneSubtopic ?? <SkeletonLoader width={200} height={20} />}
					</p>
				</div>
				{progressState.lastActivityAt && (
					<div className="bg-main-green absolute top-2 right-2 rounded-full px-2 py-1 text-sm text-black outline outline-black">
						{formatLastActivity(progressState.lastActivityAt)}
					</div>
				)}
			</div>
		</div>
	);
}
