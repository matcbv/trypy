import { ProgressContext } from '../contexts/ProgressProvider/context';
import { NavigationContext } from '../contexts/NavigationProvider/context';
import { useSafeContext } from '../hooks/useSafeContext';
import type { SubtopicData, TopicData } from '../types/content';
import type { Dispatch, RefObject } from 'react';
import { logInfo } from '../utils/logger';

interface DropdownProps {
	topic: TopicData;
	dropdownsContainer: RefObject<Array<HTMLDivElement | null>>;
	moduleOrder: number;
	setIsSidebarOpen: Dispatch<React.SetStateAction<boolean>>;
	isDesktop: boolean;
}

export function SubtopicDropdown({
	topic,
	dropdownsContainer,
	moduleOrder,
	setIsSidebarOpen,
	isDesktop,
}: DropdownProps) {
	const { progressState } = useSafeContext(ProgressContext);
	const { setNavigationState } = useSafeContext(NavigationContext);

	const changeSubtopic = (currentSubtopic: SubtopicData) => {
		if (currentSubtopic.subtopicType === 'resolution') {
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
			[moduleOrder]: {
				currentTopic: topic.slug,
				currentSubtopic: currentSubtopic.slug,
			},
		}));

		if (!isDesktop) setIsSidebarOpen(false);

		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	return (
		<div
			id={topic.slug}
			className="bg-module-background h-0 px-4 text-[0.8rem] opacity-0 transition-all duration-300"
			ref={(el) => {
				dropdownsContainer.current.push(el);
			}}
		>
			{topic.subtopics?.map((subtopic) => (
				<div key={subtopic?.title} className="flex items-center gap-x-2 pb-4">
					{progressState.doneSubtopics.includes(subtopic?.slug) ? (
						<img
							className="w-5"
							src="/assets/images/icons/success.png"
							alt="Concluído"
							draggable={false}
						/>
					) : (
						<img
							className="w-5"
							src="/assets/images/icons/circle.png"
							alt="Incompleto"
							draggable={false}
						/>
					)}
					<p
						className="lg:cursor-pointer"
						onClick={() => void changeSubtopic(subtopic)}
					>
						{subtopic?.title}
					</p>
				</div>
			))}
		</div>
	);
}
