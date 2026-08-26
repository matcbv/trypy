import { useEffect, useRef, useState } from 'react';
import { ProgressContext } from '../contexts/ProgressProvider/context';
import { SubtopicDropdown } from './SubtopicDropdown';
import { useSafeContext } from '../hooks/useSafeContext';
import type { TopicData } from '../types/content';

interface SidebarProps {
	topics: TopicData[];
	moduleOrder: number;
	sidebarButtonOffset: number;
}

export function ModuleSideBar({
	topics,
	moduleOrder,
	sidebarButtonOffset,
}: SidebarProps) {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isDesktop, setIsDesktop] = useState(false);
	const { progressState } = useSafeContext(ProgressContext);
	const dropdownsContainer = useRef<Array<HTMLDivElement | null>>([]);
	const currentContainer = useRef<HTMLDivElement>(null);
	const arrowsRef = useRef<Array<HTMLImageElement | null>>([]);
	const currentArrowRef = useRef<HTMLImageElement>(null);
	const sidebarRef = useRef<HTMLDivElement>(null);
	const sidebarIconRef = useRef<HTMLImageElement>(null);

	const handleClick = (slug: string) => {
		if (
			!progressState.doneTopics.includes(slug) &&
			progressState.inProgressTopic !== slug
		) {
			return;
		}

		const dropdown = dropdownsContainer.current.find(
			(dropdown) => dropdown?.id === slug,
		)!;
		const arrow = arrowsRef.current.find((arrow) => arrow?.id === slug)!;

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

	const iconData = (topic: TopicData) => {
		if (progressState.doneTopics.includes(topic.slug)) {
			return { src: '/assets/images/icons/success.png', alt: 'Concluído' };
		}

		if (progressState.inProgressTopic === topic.slug) {
			return { src: '/assets/images/icons/progress.png', alt: 'Em progresso' };
		}

		return { src: '/assets/images/icons/locked.png', alt: 'Bloqueado' };
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

	return (
		<>
			<div
				ref={sidebarRef}
				className={`${isSidebarOpen ? 'visible left-0' : 'invisible -left-[300px]'} absolute z-20 h-full w-[300px] shrink-0 rounded-lg bg-white/5 p-[15px] shadow-[0_0_20px_#ffffff]/5 backdrop-blur-lg transition-[left,visibility] duration-500 lg:relative lg:h-auto`}
			>
				<div className="sticky top-[80px] flex flex-col gap-y-[15px]">
					{topics?.map((topic) => (
						<div
							key={topic.title}
							className="flex cursor-pointer flex-col overflow-hidden rounded-lg bg-[#0d0a14]/80"
							onClick={() => handleClick(topic.slug)}
						>
							<div className="flex h-[75px] w-full items-center justify-between gap-x-2 rounded-lg px-[12px]">
								<div className="flex items-center gap-x-[12px]">
									<img {...iconData(topic)} className="w-5" draggable={false} />
									<p className="font-jetbrains text-[0.85rem] leading-6">
										{topic.title}
									</p>
								</div>
								{(progressState.doneTopics.includes(topic.slug) ||
									progressState.inProgressTopic === topic.slug) && (
									<img
										id={topic.slug}
										src="/assets/images/icons/arrow-down.png"
										className="transition-transform duration-300"
										ref={(el) => {
											arrowsRef.current.push(el);
										}}
										alt="Seta"
									/>
								)}
							</div>
							<SubtopicDropdown
								moduleOrder={moduleOrder}
								topic={topic}
								dropdownsContainer={dropdownsContainer}
								setIsSidebarOpen={setIsSidebarOpen}
								isDesktop={isDesktop}
							/>
						</div>
					))}
				</div>
			</div>
			<img
				src="/assets/images/icons/show-sidebar.png"
				alt="Exibir barra de navegação"
				ref={sidebarIconRef}
				className={`fixed ${isSidebarOpen ? 'left-[300px] rotate-180' : '-left-[10px]'} z-20 w-[40px] -translate-y-1/2 cursor-pointer transition-[rotate,left] duration-500 lg:hidden`}
				style={{ top: `${sidebarButtonOffset}px` }}
				onClick={() => setIsSidebarOpen((prev) => !prev)}
				role="button"
				tabIndex={0}
				draggable={false}
			/>
		</>
	);
}
