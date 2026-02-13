import { useContext } from 'react';
import { ProgressContext } from '../contexts/ProgressProvider/context';
import { fetchContent } from '../content/fetchContent';
import { NavigationContext } from '../contexts/NavigationProvider/context';
import navegationActionTypes from '../contexts/NavigationProvider/actionTypes';

export function SubtopicDropdown({ index, fields, topicsContainer }) {
	const { progressState } = useContext(ProgressContext);
	const { navigationState, navigationDispatch } = useContext(NavigationContext);

	const changeSubtopic = async (slug) => {
		const res = await fetchContent({ contentType: 'topic', include: 1 });
		const topic = res.find((topic) => {
			const subtopics = topic.fields.subtopics;
			return subtopics.find(({ fields }) => fields.slug === slug);
		});

		if (
			!progressState.doneTopics.includes(topic.fields.slug) &&
			navigationState.currentTopic !== topic.fields.slug
		) {
			return;
		}

		navigationDispatch({
			type: navegationActionTypes.SET_CURRENT_PROGRESS,
			payload: {
				currentTopic: topic.fields.slug,
				currentSubtopic: slug,
			},
		});
	};

	return (
		<div
			className="h-0 bg-[#110e1c] px-4 text-[0.85rem] opacity-0 transition-all duration-300"
			ref={(el) => (topicsContainer.current[index] = el)}
		>
			{fields.subtopics?.map(({ fields }) => (
				<div key={fields.title} className="flex items-center gap-x-2 pb-4">
					{progressState.doneSubtopics.includes(fields.slug) ? (
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
						className="hover:cursor-pointer"
						onClick={() => changeSubtopic(fields.slug)}
					>
						{fields.title}
					</p>
				</div>
			))}
		</div>
	);
}
