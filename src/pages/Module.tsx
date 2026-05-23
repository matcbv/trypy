import { useParams } from 'react-router-dom';
import { ModuleSideBar } from '../components/ModuleSideBar';
import { useEffect, useState } from 'react';
import { fetchContent } from '../content/services/fetchContent';
import { contentfulFormatter } from '../content/formatters/contentfulFormatter';
import { ModuleButtons } from '../components/ModuleButtons';
import { NavigationContext } from '../contexts/NavigationProvider/context';
import navigationActionTypes from '../contexts/NavigationProvider/actionTypes';
import { hydrateNavigationState } from '../database/services/hydrateNavigationState';
import { AuthContext } from '../contexts/AuthProvider/context';
import { ProgressContext } from '../contexts/ProgressProvider/context';
import { logError } from '../utils/logger';
import { useSafeContext } from '../hooks/useSafeContext';
import type { ModuleData, SubtopicData, TopicData } from '../types/content';
import { mapContent } from '../content/mappers/mapContent';

export function Module() {
	const { authState } = useSafeContext(AuthContext);
	const { progressState } = useSafeContext(ProgressContext);
	const { navigationState, navigationDispatch } =
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
			if (!params.moduleId) return;

			try {
				const content = await fetchContent({
					contentType: 'module',
					include: 4,
					orderOrSlug: params.moduleId,
				});
				if (!content[0])
					throw new Error(`Não foi possível obter o módulo ${params.moduleId}`);

				setModuleData(mapContent(content[0]));
			} catch (error) {
				logError(
					error,
					'Não foi possível carregar o conteúdo do módulo. Tente novamente ou fale conosco.',
				);
			}
		})();
	}, [params.moduleId]);

	// * useEffect responsável por repor o estado de navegação caso não esteja presente no usuário.
	useEffect(() => {
		if (navigationState) return;

		void (async () => {
			try {
				const progressData = await hydrateNavigationState(authState.uid!);
				navigationDispatch({
					type: navigationActionTypes.SET_CURRENT_PROGRESS,
					payload: progressData,
				});
			} catch (error) {
				logError(error);
			}
		})();
	}, [navigationState, navigationDispatch, authState.uid]);

	// * useEffect responsável pela atualização do estado de navegação ao retornar para módulos anteriores.
	useEffect(() => {
		if (!moduleData || !params.moduleId) return;
		// * Caso o módulo acessado (params.moduleId) não estiver incluído na lista de módulos concluídos, significa que ainda está sendo feito, portanto não iremos direcionar o usuário ao conteúdo final dele. Além disso, caso o módulo seja o último acessado, os dados corretos já estão em vigor. Nesses dois casos, iremos apenas dar return.
		if (
			!progressState.doneModules.includes(params.moduleId) ||
			navigationState.currentModule === params.moduleId
		)
			return;

		const lastModuleTopic = moduleData.topics.find(
			(topic) => topic.order === moduleData.topics.length,
		);

		if (!lastModuleTopic) return;

		const lastModuleSubtopic = lastModuleTopic.subtopics.find(
			(subtopic) => subtopic.order === lastModuleTopic.subtopics.length,
		);

		if (!lastModuleSubtopic) return;

		navigationDispatch({
			type: navigationActionTypes.SET_CURRENT_PROGRESS,
			payload: {
				currentModule: params.moduleId,
				currentTopic: lastModuleTopic.slug,
				currentSubtopic: lastModuleSubtopic.slug,
			},
		});
	}, [
		params.moduleId,
		progressState.doneModules,
		navigationState.currentModule,
		moduleData,
		navigationDispatch,
	]);

	// * useEffect responsável por atualizar os estados com o conteúdo do módulo obtido.
	useEffect(() => {
		if (
			!moduleData ||
			!navigationState.currentTopic ||
			!navigationState.currentSubtopic
		)
			return;

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
	}, [
		moduleData,
		navigationState.currentTopic,
		navigationState.currentSubtopic,
	]);

	return (
		<div className="relative flex justify-center gap-x-10 py-[120px]">
			<ModuleSideBar topics={topics} />
			<div className="z-20 w-[1200px] rounded-lg bg-[#0d0a14] p-10 shadow-[0_0_20px_#ffffff0f]">
				<h1 className="mb-5 text-3xl text-green-600">{subtopicData?.title}</h1>
				<div className="mb-10 flex flex-col gap-y-5">
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
				className="fixed right-4 bottom-4 z-30 cursor-pointer rounded-full bg-[var(--main-green)]/70 p-1 shadow-[0_0_10px_#000000b0] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_10px_#00ff002b]"
				onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
			>
				<img src="/assets/images/icons/arrow_up.png" alt="Voltar ao topo" />
			</button>
		</div>
	);
}
