import { useContext } from 'react';
import ProgressContext from '../contexts/ProgressProvider/context';
import { fetchContent } from '../content/fetchContent';
import progressActionType from '../contexts/ProgressProvider/actionTypes';

export function SubtopicDropdown({ index, fields, topicsContainer }) {
	const [progressData, progressDispatch] = useContext(ProgressContext);

	const changeSubtopic = async (slug) => {
		const res = await fetchContent('topic', 1);
		const topic = res.find((topic) => {
			const subtopics = topic.fields.subtopics;
			return subtopics.find((subtopic) => subtopic.fields.slug === slug);
		});

		if (
			!progressData.doneTopics.includes(topic.fields.slug) &&
			progressData.currentTopic !== topic.fields.slug
		)
			return;

		const data = {
			currentTopic: topic.fields.slug,
			currentSubtopic: slug,
		};
		await progressDispatch({
			type: progressActionType.SET_PROGRESS,
			payload: data,
		});
	};

	return (
		<div
			className="h-0 bg-[#110e1c] px-4 text-[0.85rem] opacity-0 transition-all duration-300"
			ref={(el) => (topicsContainer.current[index] = el)}
		>
			{fields.subtopics?.map(({ fields }) => (
				<div key={fields.title} className="flex items-center gap-x-2 pb-4">
					{progressData.doneSubtopics.includes(fields.slug) ? (
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
