import { useContext, useEffect, useState } from 'react';
import AuthContext from '../contexts/AuthProvider/context';
import { getNextContent } from '../content/getNextContent';
import { logError } from '../utils/logger';
import ProgressContext from '../contexts/ProgressProvider/context';
import progressActionTypes from '../contexts/ProgressProvider/actionTypes';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../database/firebase';

export function ModuleButtons({
	topics,
	subtopics,
	currentTopic,
	currentSubtopic,
}) {
	const [authData] = useContext(AuthContext);
	const [progressData, progressDispatch] = useContext(ProgressContext);
	const [isLastSubtopic, setIsLastSubtopic] = useState(false);
	const params = useParams();
	const navigate = useNavigate();

	useEffect(() => {
		const lastSubtopic = topics.at(-1)?.subtopics.at(-1)?.fields.slug;

		if (progressData.currentSubtopic === lastSubtopic) {
			setIsLastSubtopic(true);
		}
	}, [topics, progressData.doneTopics, progressData.currentSubtopic]);

	const handleClick = async (next) => {
		window.scrollTo({ top: 0, behavior: 'smooth' });

		try {
			if (next) {
				// Obtendo os próximos conteúdos:
				const [nextTopic, nextSubtopic, isLast] = getNextContent({
					topics,
					subtopics,
					currentTopic,
					currentSubtopic,
				});

				if (isLast) setIsLastSubtopic(true);

				const data = {
					currentTopic: nextTopic.slug,
					currentSubtopic: nextSubtopic.slug,
					doneSubtopics: [
						...new Set([...progressData.doneSubtopics, currentSubtopic.slug]),
					],
				};

				const isTopicDone = subtopics.every((subtopic) =>
					data.doneSubtopics.includes(subtopic.slug),
				);

				if (isTopicDone && !progressData.doneTopics.includes(nextTopic.slug)) {
					data.doneTopics = [
						...new Set([...progressData.doneTopics, currentTopic.slug]),
					];
					data.inProgressTopic = nextTopic.slug;
				}

				progressDispatch({
					type: progressActionTypes.SET_PROGRESS,
					payload: data,
				});
				await updateDoc(doc(db, 'userProgress', authData.uid), data);
			} else {
				setIsLastSubtopic(false);

				// Obtendo o subtópico anterior:
				const previousSubtopic = subtopics.find(
					(subtopic) => subtopic.order === currentSubtopic.order - 1,
				);

				if (previousSubtopic) {
					progressDispatch({
						type: progressActionTypes.SET_PROGRESS,
						payload: { currentSubtopic: previousSubtopic.slug },
					});
					await updateDoc(doc(db, 'userProgress', authData.uid), {
						currentSubtopic: previousSubtopic.slug,
					});
					return;
				}

				// Caso o subtópico anterior não exista, iremos obter o último subtópico do tópico anterior:
				const previousTopic = topics.find(
					(topic) => topic.order === currentTopic.order - 1,
				);
				if (!previousTopic) return;

				const previousSubtopics = previousTopic.subtopics.map(
					(subtic) => subtic.fields,
				);
				const newSubtopic = previousSubtopics.find(
					(subtopic) => subtopic.order === previousSubtopics.length,
				);

				const data = {
					currentTopic: previousTopic.slug,
					currentSubtopic: newSubtopic.slug,
				};

				progressDispatch({
					type: progressActionTypes.SET_PROGRESS,
					payload: data,
				});
				await updateDoc(doc(db, 'userProgress', authData.uid), data);
			}
		} catch (error) {
			logError(error);
		}
	};

	const finishModule = async () => {
		navigate('/learning-path');

		if (progressData.doneModules.includes(params.moduleId)) return;

		const data = {
			doneSubtopics: [...progressData.doneSubtopics, currentSubtopic.slug],
			doneTopics: [...progressData.doneTopics, currentTopic.slug],
			doneModules: [...progressData.doneModules, params.moduleId],
			inProgressTopic: '',
		};
		progressDispatch({
			type: progressActionTypes.SET_PROGRESS,
			payload: data,
		});
		await updateDoc(doc(db, 'userProgress', authData.uid), data);
	};

	return (
		<div className="flex justify-end gap-x-10">
			<button
				type="button"
				className={`module-btn group ${currentSubtopic.order === 0 ? 'cursor-not-allowed' : 'cursor-pointer'}`}
				disabled={currentSubtopic.order === 0}
				onClick={() => handleClick(false)}
			>
				<img
					src={`/assets/images/icons/left_arrow.png`}
					alt="Voltar"
					className="transition-transform duration-300 group-hover:-translate-x-3"
				/>
				Voltar
			</button>
			{isLastSubtopic ? (
				<button
					type="button"
					className={`module-btn group ${currentSubtopic.order === 'max' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
					onClick={finishModule}
				>
					Concluir
					<img
						src={`/assets/images/icons/done.png`}
						alt="Concluir"
						className="transition-transform duration-300 group-hover:scale-110"
					/>
				</button>
			) : (
				<button
					type="button"
					className={`module-btn group ${currentSubtopic.order === 'max' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
					onClick={() => handleClick(true)}
				>
					Avançar
					<img
						src={`/assets/images/icons/right_arrow.png`}
						alt="Avançar"
						className="transition-transform duration-300 group-hover:translate-x-3"
					/>
				</button>
			)}
		</div>
	);
}
