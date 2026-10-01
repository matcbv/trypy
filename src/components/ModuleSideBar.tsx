import { useCallback, useEffect, useRef, useState } from 'react';
import { ProgressContext } from '../contexts/ProgressProvider/context';
import { useSafeContext } from '../hooks/useSafeContext';
import type { ModuleData, SubtopicData, TopicData } from '../types/content';
import { SearchInput } from './SearchInput';
import { NavigationContext } from '../contexts/NavigationProvider/context';
import { logInfo } from '../utils/logger';

interface SidebarProps {
	currentModule: ModuleData;
	sidebarButtonOffset: number;
}

interface ChangeSubtopicProps {
	topicSlug: TopicData['slug'];
	subtopicSlug: SubtopicData['slug'];
	subtopicType: SubtopicData['subtopicType'];
}

export interface SearchResult {
	topicSlug: TopicData['slug'];
	subtopicSlug: SubtopicData['slug'];
	subtopicTitle: SubtopicData['title'];
	subtopicType: SubtopicData['subtopicType'];
}

export function ModuleSideBar({
	currentModule,
	sidebarButtonOffset,
}: SidebarProps) {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isDesktop, setIsDesktop] = useState(false);
	const [searchResult, setSearchResult] = useState<SearchResult[]>([]);
	const [searchValue, setSearchValue] = useState('');
	const { progressState } = useSafeContext(ProgressContext);
	const { setNavigationState } = useSafeContext(NavigationContext);
	const dropdownsContainer = useRef<Array<HTMLDivElement | null>>([]);
	const currentContainer = useRef<HTMLDivElement>(null);
	const arrowsRef = useRef<Array<HTMLImageElement | null>>([]);
	const currentArrowRef = useRef<HTMLImageElement>(null);
	const sidebarRef = useRef<HTMLDivElement>(null);
	const sidebarIconRef = useRef<HTMLImageElement>(null);

	const firstTopicSlug = currentModule.topics[0]!.slug;

	const isTopicBlocked = useCallback(
		(topicSlug: string) => {
			return (
				!progressState.doneTopics.includes(topicSlug) &&
				progressState.inProgressTopic !== topicSlug &&
				firstTopicSlug !== topicSlug
			);
		},
		[progressState.doneTopics, progressState.inProgressTopic, firstTopicSlug],
	);

	const changeSubtopic = ({
		topicSlug,
		subtopicSlug,
		subtopicType,
	}: ChangeSubtopicProps) => {
		if (isTopicBlocked(topicSlug)) return;

		if (subtopicType === 'resolution') {
			const topic = currentModule.topics.find(
				(topic) => topic.slug === topicSlug,
			)!;

			const topicExercise = topic.subtopics.find(
				(subtopic) => subtopic.subtopicType === 'exercise',
			);

			if (!progressState.doneSubtopics.includes(topicExercise!.slug)) {
				logInfo('Conclua o exercício para acessar sua resolução');
				return;
			}
		}

		setNavigationState((prev) => ({
			...prev,
			[currentModule.order]: {
				currentTopic: topicSlug,
				currentSubtopic: subtopicSlug,
			},
		}));
		setSearchValue('');

		if (!isDesktop) setIsSidebarOpen(false);

		window.scrollTo(0, 0);
	};

	const handleClick = ({
		topicSlug,
		index,
	}: {
		topicSlug: string;
		index: number;
	}) => {
		if (isTopicBlocked(topicSlug)) return;

		const dropdown = dropdownsContainer.current[index];
		const arrow = arrowsRef.current[index];
		if (!dropdown || !arrow) return;

		if (currentContainer.current) {
			currentContainer.current.style =
				'height: 0; padding: 0 16px; opacity: 0%';
		}

		if (currentArrowRef.current) {
			currentArrowRef.current.style = 'transform: rotate(0deg)';
		}

		if (dropdown === currentContainer.current) {
			dropdown.style = 'height: 0; padding: 0 16px; opacity: 0%';
			arrow.style = 'transform: rotate(0deg)';
			currentContainer.current = null;
			currentArrowRef.current = null;
		} else {
			const topicsHeight = dropdown.scrollHeight;
			dropdown.style = `height: ${topicsHeight + 16}px; padding: 16px; opacity:100%`;
			arrow.style = 'transform: rotate(180deg)';
			currentContainer.current = dropdown;
			currentArrowRef.current = arrow;
		}
	};

	// * useEffect responsável por exibir ou esconder a sidebar de acordo com o tamanho da viewport.
	useEffect(() => {
		const mediaQuery = window.matchMedia('(min-width: 1024px)');

		const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
			setIsSidebarOpen(e.matches);
			setIsDesktop(e.matches);
		};

		handleChange(mediaQuery);
		mediaQuery.addEventListener('change', handleChange);

		return () => mediaQuery.removeEventListener('change', handleChange);
	}, []);

	// * useEffect responsável por fechar a sidebar ao clicar fora dela.
	useEffect(() => {
		if (isDesktop) return;

		const sidebar = sidebarRef.current;
		const sidebarIcon = sidebarIconRef.current;
		if (!sidebar || !sidebarIcon) return;

		const handleClick = (e: globalThis.MouseEvent) => {
			if (e.target !== sidebarIcon && !sidebar.contains(e.target as Node)) {
				setIsSidebarOpen(false);
			}
		};

		document.addEventListener('click', handleClick);

		return () => document.removeEventListener('click', handleClick);
	}, [isDesktop]);

	const topicIconData = (topic: TopicData) => {
		if (progressState.doneTopics.includes(topic.slug)) {
			return { src: '/assets/images/icons/success.png', alt: 'Concluído' };
		}

		if (
			progressState.inProgressTopic === topic.slug ||
			firstTopicSlug === topic.slug
		) {
			return { src: '/assets/images/icons/progress.png', alt: 'Em progresso' };
		}

		return { src: '/assets/images/icons/locked.png', alt: 'Bloqueado' };
	};

	return (
		<>
			<div
				ref={sidebarRef}
				className={`${isSidebarOpen ? 'visible left-0' : 'invisible -left-75'} absolute z-20 h-full w-75 rounded-lg bg-white/5 shadow-[0_0_20px_#ffffff]/5 backdrop-blur-lg transition-[left,visibility] duration-500 lg:relative lg:h-auto`}
			>
				<div className="sidebarScrollbar sticky top-[70px] h-[calc(100vh-120px)] overflow-x-auto p-3 lg:h-fit">
					<SearchInput
						currentModule={currentModule}
						searchValue={searchValue}
						setSearchValue={setSearchValue}
						setSearchResult={setSearchResult}
						isTopicBlocked={isTopicBlocked}
					/>
					{searchValue ? (
						searchResult.length > 0 ? (
							<div className="flex flex-col gap-y-2">
								{searchResult.map(
									({
										topicSlug,
										subtopicSlug,
										subtopicTitle,
										subtopicType,
									}) => (
										<div
											key={subtopicSlug}
											className="bg-module-background/80 flex items-center gap-x-2 rounded-md px-2 py-4"
											onClick={() =>
												void changeSubtopic({
													topicSlug,
													subtopicSlug,
													subtopicType,
												})
											}
										>
											<img
												className="w-5"
												src={`/assets/images/icons/${progressState.doneSubtopics.includes(subtopicSlug) ? 'success' : 'circle'}.png`}
												alt={
													progressState.doneSubtopics.includes(subtopicSlug)
														? 'Concluído'
														: 'Incompleto'
												}
												draggable={false}
											/>
											<p className="text-[0.8rem] lg:cursor-pointer">
												{subtopicTitle}
											</p>
										</div>
									),
								)}
							</div>
						) : (
							<div className="flex flex-col items-center justify-center gap-y-2 rounded-full">
								<img
									src="/assets/images/not-found.png"
									alt="Não encontrado"
									className="opacity-50 drop-shadow-[0_0_20px_#ffffff]"
								/>
								<p className="text-gray-400 text-shadow-[0_0_10px_#ffffff80]">
									Nenhum resultado encontrado
								</p>
							</div>
						)
					) : (
						<div className="flex flex-col gap-y-3">
							{currentModule.topics?.map((topic, index) => (
								<div
									key={topic.slug}
									className="bg-module-background/80 flex flex-col overflow-hidden rounded-lg lg:cursor-pointer"
									onClick={() => handleClick({ topicSlug: topic.slug, index })}
								>
									<div className="flex h-[75px] w-full items-center justify-between gap-x-2 rounded-lg px-3">
										<div className="flex items-center gap-x-2">
											<img
												{...topicIconData(topic)}
												className="w-5"
												draggable={false}
											/>
											<p className="font-jetbrains text-[0.85rem] leading-6">
												{topic.title}
											</p>
										</div>
										{!isTopicBlocked(topic.slug) && (
											<img
												id={topic.slug}
												src="/assets/images/icons/arrow-down.png"
												className="transition-transform duration-300"
												ref={(el) => {
													arrowsRef.current[index] = el;
												}}
												alt="Seta"
												draggable={false}
											/>
										)}
									</div>
									<div
										id={topic.slug}
										className="bg-module-background h-0 px-4 opacity-0 transition-all duration-300"
										ref={(el) => {
											dropdownsContainer.current[index] = el;
										}}
									>
										{topic.subtopics?.map((subtopic) => (
											<div
												key={subtopic.slug}
												className="flex items-center gap-x-2 pb-4"
												onClick={() =>
													void changeSubtopic({
														topicSlug: topic.slug,
														subtopicSlug: subtopic.slug,
														subtopicType: subtopic.subtopicType,
													})
												}
											>
												<img
													className="w-5"
													src={`/assets/images/icons/${progressState.doneSubtopics.includes(subtopic.slug) ? 'success' : 'circle'}.png`}
													alt={
														progressState.doneSubtopics.includes(subtopic.slug)
															? 'Concluído'
															: 'Incompleto'
													}
													draggable={false}
												/>
												<p className="text-[0.8rem] lg:cursor-pointer">
													{subtopic.title}
												</p>
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
			<img
				src="/assets/images/icons/show-sidebar.png"
				alt="Exibir barra de navegação"
				ref={sidebarIconRef}
				className={`fixed ${isSidebarOpen ? 'left-75 rotate-180' : '-left-[10px]'} z-20 w-10 -translate-y-1/2 transition-[rotate,left] duration-500 lg:hidden`}
				style={{ top: `${sidebarButtonOffset}px` }}
				onClick={() => setIsSidebarOpen((prev) => !prev)}
				role="button"
				tabIndex={0}
				draggable={false}
			/>
		</>
	);
}
