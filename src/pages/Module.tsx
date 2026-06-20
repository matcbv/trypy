import { useParams } from 'react-router-dom';
import { ModuleSideBar } from '../components/ModuleSideBar';
import { useEffect, useState } from 'react';
import { fetchContent } from '../content/services/fetchContent';
import { contentfulFormatter } from '../content/formatters/contentfulFormatter';
import { ModuleButtons } from '../components/ModuleButtons';
import { NavigationContext } from '../contexts/NavigationProvider/context';
import { hydrateNavigationState } from '../database/services/hydrateNavigationState';
import { AuthContext } from '../contexts/AuthProvider/context';
import { ProgressContext } from '../contexts/ProgressProvider/context';
import { logError } from '../utils/logger';
import { useSafeContext } from '../hooks/useSafeContext';
import type { ModuleData, SubtopicData, TopicData } from '../types/content';
import { mapContent } from '../content/mappers/mapContent';
import { Terminal } from '../components/Terminal';

export function Module() {
	const { authState } = useSafeContext(AuthContext);
	const { progressState } = useSafeContext(ProgressContext);
	const { navigationState, setNavigationState } =
		useSafeContext(NavigationContext);
	const [moduleData, setModuleData] = useState<ModuleData | null>(null);
	const [topics, setTopics] = useState<TopicData[]>([]);
	const [topicData, setTopicData] = useState<TopicData | null>(null);
	const [subtopics, setSubtopics] = useState<SubtopicData[]>([]);
	const [subtopicData, setSubtopicData] = useState<SubtopicData | null>(null);
	const params = useParams<{ moduleId: string }>();

	// * useEffect para obter o conteúdo do módulo a ser exibido.
	useEffect(() => {
		void (async () => {
			const { moduleId } = params;
			if (!moduleId) return;

			try {
				const content = await fetchContent({
					contentType: 'module',
					include: 4,
					orderOrSlug: moduleId,
				});

				if (!content[0]) {
					throw new Error(`Não foi possível obter o módulo ${moduleId}`);
				}

				setModuleData(mapContent(content[0]));
			} catch (error) {
				logError(
					error,
					'Não foi possível carregar o conteúdo do módulo. Tente novamente ou fale conosco.',
				);
			}
		})();
	}, [params]);

	// * useEffect responsável por repor o estado de navegação caso não esteja presente no usuário.
	useEffect(() => {
		if (navigationState) return;

		void (async () => {
			try {
				const progressData = await hydrateNavigationState(authState.uid!);
				setNavigationState((prev) => ({ ...prev, ...progressData }));
			} catch (error) {
				logError(error);
			}
		})();
	}, [navigationState, authState.uid, setNavigationState]);

	// * useEffect responsável pela atualização do estado de navegação ao navegar entre módulos.
	useEffect(() => {
		const { moduleId } = params;

		if (!moduleData || !moduleId) return;

		// * Caso o módulo acessado não esteja presente na lista de módulos concluídos, significa que ainda está em progresso. Portanto, iremos atualizar o estado de navegação com os dados do progresso do usuário.
		if (!progressState.doneModules.includes(moduleId)) {
			setNavigationState((prev) => ({
				...prev,
				currentModule: progressState.inProgressModule,
				currentTopic: progressState.inProgressTopic,
				currentSubtopic: progressState.inProgressSubtopic,
			}));
			return;
		}

		const lastModuleTopic = moduleData.topics.find(
			(topic) => topic.order === moduleData.topics.length,
		);

		if (!lastModuleTopic) return;

		const lastModuleSubtopic = lastModuleTopic.subtopics.find(
			(subtopic) => subtopic.order === lastModuleTopic.subtopics.length,
		);

		if (!lastModuleSubtopic) return;

		// * Caso o módulo já tenha sido concluído, iremos atualizar o estado de navegação com o último tópico e subtópico daquele módulo.
		setNavigationState((prev) => ({
			...prev,
			currentModule: moduleId,
			currentTopic: lastModuleTopic.slug,
			currentSubtopic: lastModuleSubtopic.slug,
		}));

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [params.moduleId, moduleData]);

	// * useEffect responsável por atualizar os estados com o conteúdo do módulo obtido.
	useEffect(() => {
		if (!moduleData) return;

		const topic = moduleData.topics.find(
			(topic) => topic.slug === navigationState.currentTopic,
		);

		if (!topic) return;

		const subtopic = topic?.subtopics.find(
			(subtopic) => subtopic.slug === navigationState.currentSubtopic,
		);

		if (!subtopic) return;

		setTopics(moduleData.topics.map((topic) => topic));
		setTopicData(topic);
		setSubtopics(topic.subtopics.map((subtopic) => subtopic));
		setSubtopicData(subtopic);

		const lastSubtopic = moduleData.topics.at(-1)?.subtopics.at(-1);

		setNavigationState((prev) => ({
			...prev,
			isLastSubtopic: subtopic.slug === lastSubtopic?.slug,
		}));
	}, [
		moduleData,
		navigationState.currentTopic,
		navigationState.currentSubtopic,
		setNavigationState,
	]);

	return (
		<div className="relative flex min-h-screen justify-center gap-x-10 py-[120px]">
			<ModuleSideBar topics={topics} />
			<div className="w-[1200px] rounded-lg bg-[#0d0a14] p-10 shadow-[0_0_20px_#ffffff0f]">
				<h1 className="text-main-green mb-5 text-3xl">{subtopicData?.title}</h1>
				<div className="mb-10 flex flex-col gap-y-5">
					{subtopicData?.isExercise && <Terminal />}
					{subtopicData?.content && contentfulFormatter(subtopicData.content)}
					{subtopicData?.videoLink && (
						<div className="flex justify-center">
							<iframe
								className="h-[360px] w-[640px] rounded-md shadow-[0_0_30px_#ffffff0f]"
								src={subtopicData?.videoLink}
								title={subtopicData?.title}
								frameBorder="0"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
								referrerPolicy="strict-origin-when-cross-origin"
								allowFullScreen
							></iframe>
						</div>
					)}
				</div>
				<ModuleButtons
					topics={topics}
					subtopics={subtopics}
					moduleData={moduleData!}
					topicData={topicData!}
					subtopicData={subtopicData!}
				/>
			</div>
			<button
				type="button"
				className="bg-main-green fixed right-4 bottom-4 z-10 cursor-pointer rounded-full p-1 shadow-[0_0_10px_#000000b0] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_10px_#00ff002b]"
				onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
			>
				<img src="/assets/images/icons/arrow-up.png" alt="Voltar ao topo" />
			</button>
		</div>
	);
}
