import { useLocation, useParams } from 'react-router-dom';
import { ModuleSideBar } from '../components/ModuleSideBar';
import { useEffect, useRef, useState } from 'react';
import { fetchContent } from '../content/services/fetchContent';
import { contentfulFormatter } from '../content/formatters/contentfulFormatter';
import { ModuleButtons } from '../components/ModuleButtons';
import { NavigationContext } from '../contexts/NavigationProvider/context';
import { logError } from '../utils/logger';
import { useSafeContext } from '../hooks/useSafeContext';
import type { ModuleData, SubtopicData, TopicData } from '../types/content';
import { mapContent } from '../content/mappers/mapContent';
import { Terminal } from '../components/Terminal';
import { LoadingPage } from './LoadingPage';
import { updateDoc } from 'firebase/firestore';
import { userNavigationRef } from '../database/refs/userRefs';
import { AuthContext } from '../contexts/AuthProvider/context';
import { themeStyles, type Themes } from '../constants/themeStyle';

export function Module() {
	const { authState } = useSafeContext(AuthContext);
	const { navigationState } = useSafeContext(NavigationContext);
	const [moduleData, setModuleData] = useState<ModuleData | null>(null);
	const [topics, setTopics] = useState<TopicData[]>([]);
	const [topicData, setTopicData] = useState<TopicData | null>(null);
	const [subtopics, setSubtopics] = useState<SubtopicData[]>([]);
	const [subtopicData, setSubtopicData] = useState<SubtopicData | null>(null);
	const [scrollY, setScrollY] = useState(0);
	const [offset, setOffset] = useState(20);
	const footerRef = useRef<HTMLElement>(null);
	const params = useParams<{ moduleId: string }>();
	const location = useLocation();
	const { theme } = location.state as { theme: Themes };

	// * useEffect para aparição e posicionamento do botão de scroll para o topo.
	useEffect(() => {
		footerRef.current = document.querySelector('footer');

		const handleScroll = () => {
			setScrollY(window.scrollY);

			if (!footerRef.current) return;

			const footerTop = footerRef.current.getBoundingClientRect().top;
			const overlap = window.innerHeight - footerTop;
			// Setando o maior valor entre o intervalo citado. Ao descer a tela, o valor irá se aproximar cada vez mais de 20, parando nele.
			setOffset(Math.max(20, overlap + 20));
		};
		window.addEventListener('scroll', handleScroll, { passive: true });

		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	// * useEffect para obter o conteúdo do módulo a ser exibido.
	useEffect(() => {
		void (async () => {
			const { moduleId } = params;

			if (!moduleId) return;

			try {
				const content = await fetchContent({
					contentType: 'module',
					include: 3,
					slug: moduleId,
				});

				if (!content[0]) {
					throw new Error(`Não foi possível obter o módulo ${moduleId}`);
				}
				setModuleData(mapContent(content[0]));
			} catch (error) {
				logError({
					error,
					text: 'Não foi possível carregar o conteúdo do módulo. Tente novamente ou fale conosco.',
				});
			}
		})();
	}, [params]);

	// * useEffect responsável por atualizar os estados com o conteúdo do módulo obtido.
	useEffect(() => {
		if (!moduleData) return;
		const topic = moduleData.topics.find(
			(topic) => topic.slug === navigationState[moduleData.order]!.currentTopic,
		);
		if (!topic) return;

		const subtopic = topic.subtopics.find(
			(subtopic) =>
				subtopic.slug === navigationState[moduleData.order]!.currentSubtopic,
		);

		if (!subtopic) return;

		setTopics(moduleData.topics.map((topic) => topic));
		setTopicData(topic);
		setSubtopics(topic.subtopics.map((subtopic) => subtopic));
		setSubtopicData(subtopic);
	}, [moduleData, navigationState]);

	// * useEffect para atualização persistente dos dados de navegação do usuário no banco de dados.
	useEffect(() => {
		const { uid } = authState;

		if (!uid || !moduleData || !topicData || !subtopicData) return;

		void (async () => {
			await updateDoc(userNavigationRef(uid), {
				[moduleData.order]: {
					currentTopic: topicData.slug,
					currentSubtopic: subtopicData.slug,
				},
			});
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [subtopicData]);

	return (
		<div className="relative flex min-h-screen justify-center gap-x-10 px-[50px] py-[120px]">
			{!moduleData || !topicData || !subtopicData ? (
				<LoadingPage />
			) : (
				<>
					<ModuleSideBar topics={topics} moduleOrder={moduleData.order} />
					<div
						className="w-[1200px] rounded-lg bg-[#0d0a14] p-10 shadow-[0_0_20px_#ffffff]/5"
						style={
							{
								'--theme-color': `var(${themeStyles[theme].color})`,
								'--highlight-theme-color': `var(${themeStyles[theme].highlight})`,
							} as React.CSSProperties
						}
					>
						<h1 className={`mb-5 text-3xl tracking-wide text-(--theme-color)!`}>
							{subtopicData?.title}
						</h1>
						<div className="mb-10 flex flex-col gap-y-5">
							{subtopicData?.content &&
								contentfulFormatter(subtopicData.content)}
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
							{subtopicData?.isExercise && (
								<Terminal subtopicData={subtopicData} />
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
					{scrollY > 0 && (
						<span
							className={`bg-main-green fixed right-[10px] z-10 flex size-[30px] shrink-0 cursor-pointer items-center justify-center rounded-full shadow-[0_0_10px_#000000b0] transition-shadow transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_0_10px_var(--color-glow-green)]/50`}
							onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
							style={{ bottom: `${offset}px` }}
						>
							<img src="/assets/images/icons/arrow-up.png" alt="Ir ao topo" />
						</span>
					)}
				</>
			)}
		</div>
	);
}
