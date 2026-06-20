import { useRef } from 'react';
import { ProgressContext } from '../contexts/ProgressProvider/context';
import { SubtopicDropdown } from './SubtopicDropdown';
import { useSafeContext } from '../hooks/useSafeContext';
import type { TopicData } from '../types/content';

export function ModuleSideBar({ topics }: { topics: TopicData[] }) {
	const { progressState } = useSafeContext(ProgressContext);
	const dropdownsContainer = useRef<(HTMLDivElement | null)[]>([]);
	const currentContainer = useRef<HTMLDivElement>(null);
	const arrows = useRef<(HTMLImageElement | null)[]>([]);
	const currentArrow = useRef<HTMLImageElement>(null);

	const handleClick = (slug: string) => {
		if (
			!progressState.doneTopics.includes(slug) &&
			progressState.inProgressTopic !== slug
		)
			return;

		const dropdown = dropdownsContainer.current.find(
			(dropdown) => dropdown?.id === slug,
		)!;
		const arrow = arrows.current.find((arrow) => arrow?.id === slug)!;

		if (currentContainer.current)
			currentContainer.current.style =
				'height: 0; padding: 0 16px; opacity: 0%';
		if (currentArrow.current)
			currentArrow.current.style = 'transform: rotate(0deg)';

		if (dropdown === currentContainer.current) {
			dropdown.style = 'height: 0; padding: 0 16px; opacity: 0%';
			arrow.style = 'transform: rotate(0deg)';
			currentContainer.current = null;
			currentArrow.current = null;
		} else {
			const topicsHeight = dropdown.scrollHeight;
			dropdown.style = `height: ${topicsHeight + 16}px; padding: 16px; opacity:100%`;
			arrow.style = 'transform: rotate(180deg)';
			currentContainer.current = dropdown;
			currentArrow.current = arrow;
		}
	};

	const iconData = (topic: TopicData) => {
		if (progressState.doneTopics.includes(topic.slug)) {
			return { src: '/assets/images/icons/success.png', alt: 'Concluído' };
		}

		if (progressState.inProgressTopic === topic.slug)
			return { src: '/assets/images/icons/progress.png', alt: 'Em progresso' };

		return { src: '/assets/images/icons/locked.png', alt: 'Bloqueado' };
	};

	return (
		<div className="relative w-[300px] shrink-0 rounded-lg bg-[#272149]/40 p-4 shadow-[0_0_20px_#ffffff0f]">
			<div className="sticky top-[84px] flex flex-col gap-y-4">
				{topics?.map((topic) => (
					<div
						key={topic.title}
						className="flex cursor-pointer flex-col overflow-hidden rounded-lg bg-[#0d0a14]/80"
						onClick={() => handleClick(topic.slug)}
					>
						<div className="flex h-[75px] w-full items-center justify-between gap-x-2 px-3">
							<div className="flex items-center gap-x-3">
								<img {...iconData(topic)} className="w-5" draggable={false} />
								<p className="font-jetbrains text-sm leading-6">
									{topic.title}
								</p>
							</div>
							{(progressState.doneTopics.includes(topic.slug) ||
								progressState.inProgressTopic === topic.slug) && (
								<img
									id={topic.slug}
									src="/assets/images/icons/arrow.png"
									className="transition-transform duration-300"
									ref={(el) => {
										arrows.current.push(el);
									}}
									alt="Seta"
								/>
							)}
						</div>
						<SubtopicDropdown
							lastSubtopicSlug={topics.at(-1)!.subtopics.at(-1)!.slug}
							topic={topic}
							dropdownsContainer={dropdownsContainer}
						/>
					</div>
				))}
			</div>
		</div>
	);
}
