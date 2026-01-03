import { useParams } from 'react-router-dom';
import { ModuleSideBar } from '../components/ModuleSideBar';
import { useContext, useEffect, useState } from 'react';
import { fetchContent } from '../content/fetchContent';
import { contentfulFormatter } from '../content/contentfulFormatter';
import ProgressContext from '../contexts/ProgressProvider/context';
import { ModuleButtons } from '../components/ModuleButtons';

export function Module() {
	const [progressData] = useContext(ProgressContext);
	const [topics, setTopics] = useState([]);
	const [currentTopic, setCurrentTopic] = useState({});
	const [subtopics, setSubtopics] = useState([]);
	const [currentSubtopic, setCurrentSubtopic] = useState({});
	const [isLastSubtopic, setIsLastSubtopic] = useState(false);
	const params = useParams();

	useEffect(() => {
		if (!progressData?.currentTopic || !progressData?.currentSubtopic) return;

		(async () => {
			const content = await fetchContent('module', 4, params.moduleId);
			const topics = content[0].fields.topics;
			const topic = topics.find(
				({ fields }) => fields.slug === progressData.currentTopic,
			);
			const subtopic = topic.fields.subtopics.find(
				({ fields }) => fields.slug === progressData.currentSubtopic,
			);
			const nextTopic = topics.find(
				({ fields }) => fields.order === topic.fields.order + 1,
			);

			setTopics(topics.map((topic) => topic.fields));
			setCurrentTopic(topic.fields);
			setSubtopics(topic.fields.subtopics.map((subtopic) => subtopic.fields));
			setCurrentSubtopic(subtopic.fields);
			setIsLastSubtopic(
				nextTopic ? false : subtopic.fields.order === subtopics.length,
			);
		})();
	}, [params.moduleId, subtopics.length, progressData]);

	return (
		<div className="relative flex justify-center gap-x-10 py-[120px]">
			<ModuleSideBar topics={topics} />
			<div className="z-20 w-[1200px] rounded-lg bg-[#0d0a14] p-10 shadow-[0_0_20px_#ffffff0f]">
				<h1 className="mb-5 text-3xl text-green-600">
					{currentSubtopic.title}
				</h1>
				<div className="mb-10 flex flex-col gap-y-5">
					{contentfulFormatter(currentSubtopic.content)}
					{currentSubtopic.videoLink && (
						<div className="flex justify-center">
							<iframe
								className="h-[360px] w-[640px] rounded-md shadow-[0_0_30px_#ffffff0f]"
								src={currentSubtopic.videoLink}
								title={currentSubtopic.title}
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
					currentTopic={currentTopic}
					subtopics={subtopics}
					currentSubtopic={currentSubtopic}
					isLastSubtopicState={[isLastSubtopic, setIsLastSubtopic]}
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
