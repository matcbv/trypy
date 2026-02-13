import { useParams } from 'react-router-dom';
import { ModuleSideBar } from '../components/ModuleSideBar';
import { useContext, useEffect, useState } from 'react';
import { fetchContent } from '../content/fetchContent';
import { contentfulFormatter } from '../content/contentfulFormatter';
import { ModuleButtons } from '../components/ModuleButtons';
import { NavigationContext } from '../contexts/NavigationProvider/context';
import navegationActionTypes from '../contexts/NavigationProvider/actionTypes';
import { hydrateNavegationState } from '../utils/hydrateNavegationState';
import { AuthContext } from '../contexts/AuthProvider/context';
import { ProgressContext } from '../contexts/ProgressProvider/context';
import { logError } from '../utils/logger';

export function Module() {
	const { authState } = useContext(AuthContext);
	const { progressState } = useContext(ProgressContext);
	const { navigationState, navigationDispatch } = useContext(NavigationContext);
	const [moduleData, setModuleData] = useState(null);
	const [topics, setTopics] = useState([]);
	const [topicData, setTopicData] = useState({});
	const [subtopics, setSubtopics] = useState([]);
	const [subtopicData, setSubtopicData] = useState({});
	const params = useParams();

	useEffect(() => {
		(async () => {
			const content = await fetchContent({
				contentType: 'module',
				include: 4,
				orderOrSlug: params.moduleId,
			});
			setModuleData(content[0].fields);
		})();
	}, [params.moduleId]);

	useEffect(() => {
		if (!navigationState) {
			(async () => {
				try {
					const progressData = await hydrateNavegationState(authState.uid);
					navigationDispatch({
						type: navegationActionTypes.SET_CURRENT_PROGRESS,
						payload: progressData,
					});
				} catch (error) {
					logError(error);
				}
			})();
		}
	}, [navigationState, navigationDispatch, authState.uid]);

	useEffect(() => {
		if (!moduleData) return;
		if (!progressState.doneModules.includes(params.moduleId)) return;
		if (navigationState.currentModule === params.moduleId) return;

		const lastModuleTopic = moduleData.topics.find(
			({ fields }) => fields.order === moduleData.topics.length,
		);
		const lastModuleSubtopic = lastModuleTopic.fields.subtopics.find(
			({ fields }) => fields.order === lastModuleTopic.fields.subtopics.length,
		);
		navigationDispatch({
			type: navegationActionTypes.SET_CURRENT_PROGRESS,
			payload: {
				currentModule: params.moduleId,
				currentTopic: lastModuleTopic.fields.slug,
				currentSubtopic: lastModuleSubtopic.fields.slug,
			},
		});
	}, [
		params.moduleId,
		progressState.doneModules,
		navigationState.currentModule,
		moduleData,
		navigationDispatch,
	]);

	useEffect(() => {
		if (!moduleData) return;
		if (!navigationState.currentTopic) return;
		if (!navigationState.currentSubtopic) return;

		(async () => {
			const topic = moduleData.topics.find(
				({ fields }) => fields.slug === navigationState.currentTopic,
			);
			const subtopic = topic.fields.subtopics.find(
				({ fields }) => fields.slug === navigationState.currentSubtopic,
			);
			setTopics(moduleData.topics.map(({ fields }) => fields));
			setTopicData(topic.fields);
			setSubtopics(topic.fields.subtopics.map((subtopic) => subtopic.fields));
			setSubtopicData(subtopic.fields);

			const nextTopic = moduleData.topics.find(
				({ fields }) => fields?.order === topic.fields.order + 1,
			);

			navigationDispatch({
				type: navegationActionTypes.SET_IS_LAST_SUBTOPIC,
				payload: nextTopic
					? false
					: subtopic.fields.order === topic.fields.subtopics.length,
			});
		})();
	}, [
		moduleData,
		params.moduleId,
		navigationState.currentTopic,
		navigationState.currentSubtopic,
		navigationDispatch,
	]);

	return (
		<div className="relative flex justify-center gap-x-10 py-[120px]">
			<ModuleSideBar topics={topics} />
			<div className="z-20 w-[1200px] rounded-lg bg-[#0d0a14] p-10 shadow-[0_0_20px_#ffffff0f]">
				<h1 className="mb-5 text-3xl text-green-600">{subtopicData.title}</h1>
				<div className="mb-10 flex flex-col gap-y-5">
					{contentfulFormatter(subtopicData.content)}
					{subtopicData.videoLink && (
						<div className="flex justify-center">
							<iframe
								className="h-[360px] w-[640px] rounded-md shadow-[0_0_30px_#ffffff0f]"
								src={subtopicData.videoLink}
								title={subtopicData.title}
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
					moduleData={moduleData}
					topicData={topicData}
					subtopicData={subtopicData}
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
