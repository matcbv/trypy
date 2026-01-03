import { useContext, useRef } from 'react';
import ProgressContext from '../contexts/ProgressProvider/context';
import { SubtopicDropdown } from './SubtopicDropdown';

export function ModuleSideBar({ topics }) {
	const [progressData] = useContext(ProgressContext);
	const topicsContainer = useRef([]);
	const currentContainer = useRef(null);
	const arrows = useRef([]);
	const currentArrow = useRef(null);

	const handleClick = (index) => {
		const container = topicsContainer.current[index];
		const arrow = arrows.current[index];

		if (currentContainer.current)
			currentContainer.current.style =
				'height: 0; padding: 0 16px; opacity: 0%';
		if (currentArrow.current)
			currentArrow.current.style = 'transform: rotate(0deg)';

		if (container === currentContainer.current) {
			container.style = 'height: 0; padding: 0 16px; opacity: 0%';
			arrow.style = 'transform: rotate(0deg)';
			currentContainer.current = null;
			currentArrow.current = null;
		} else {
			const topicsHeight = container.scrollHeight;
			container.style = `height: ${topicsHeight + 16}px; padding: 16px; opacity:100%`;
			arrow.style = 'transform: rotate(180deg)';
			currentContainer.current = container;
			currentArrow.current = arrow;
		}
	};

	const iconData = (topic) => {
		if (progressData.doneTopics.includes(topic.slug)) {
			return { src: '/assets/images/icons/success.png', alt: 'Concluído' };
		}

		if (progressData.inProgressTopic === topic.slug)
			return { src: '/assets/images/icons/progress.png', alt: 'Em progresso' };

		return { src: '/assets/images/icons/locked.png', alt: 'Bloqueado' };
	};

	return (
		<div className="s z-20 flex h-screen w-[300px] shrink-0 flex-col gap-y-5 rounded-lg bg-[#27214950] p-4 shadow-[0_0_20px_#ffffff0f]">
			{topics?.map((topic, index) => (
				<div
					key={topic.title}
					className="flex flex-col overflow-hidden rounded-lg bg-[#0d0a14]"
				>
					<div className="flex h-[75px] w-full items-center justify-between gap-x-2 px-3">
						<div className="flex items-center gap-x-3">
							<img {...iconData(topic)} className="w-5" draggable={false} />
							<p className="font-jetbrains text-sm leading-relaxed">
								{topic.title}
							</p>
						</div>
						{(progressData.doneTopics.includes(topic.slug) ||
							progressData.inProgressTopic === topic.slug) && (
							<img
								src="/assets/images/icons/arrow.png"
								className="cursor-pointer transition-transform duration-300"
								onClick={() => handleClick(index)}
								ref={(el) => (arrows.current[index] = el)}
								alt="Seta"
							/>
						)}
					</div>
					<SubtopicDropdown
						index={index}
						fields={topic}
						topicsContainer={topicsContainer}
					/>
				</div>
			))}
		</div>
	);
}
