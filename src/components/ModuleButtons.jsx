import { useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthProvider/context';
import { getNextContent } from '../content/getNextContent';
import { logError } from '../utils/logger';
import { ProgressContext } from '../contexts/ProgressProvider/context';
import progressActionTypes from '../contexts/ProgressProvider/actionTypes';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../database/firebase';
import { NavigationContext } from '../contexts/NavigationProvider/context';
import navegationActionTypes from '../contexts/NavigationProvider/actionTypes';

export function ModuleButtons({
	topics,
	subtopics,
	moduleData,
	topicData,
	subtopicData,
}) {
	const { authState } = useContext(AuthContext);
	const { progressState, progressDispatch } = useContext(ProgressContext);
	const { navigationState, navigationDispatch } = useContext(NavigationContext);
	const params = useParams();
	const navigate = useNavigate();

	useEffect(() => {
		const lastSubtopic = topics.at(-1)?.subtopics.at(-1)?.fields.slug;

		if (progressState.currentSubtopic === lastSubtopic) {
			navigationDispatch({
				type: navegationActionTypes.SET_IS_LAST_SUBTOPIC,
				payload: true,
			});
		}
	}, [topics, progressState.currentSubtopic, navigationDispatch]);

	const handleNext = async () => {
		window.scrollTo({ top: 0, behavior: 'smooth' });

		const data = {};

		try {
			const { nextTopic, nextSubtopic, isLastSubtopic } = await getNextContent(
				moduleData,
				topicData,
				subtopicData,
			);

			// Validando se o novo subtópico é o último do módulo.
			if (isLastSubtopic) {
				navigationDispatch({
					type: navegationActionTypes.SET_IS_LAST_SUBTOPIC,
					payload: true,
				});
			}

			navigationDispatch({
				type: navegationActionTypes.SET_CURRENT_PROGRESS,
				payload: {
					currentTopic: nextTopic.slug || '',
					currentSubtopic: nextSubtopic.slug || '',
				},
			});

			// Adicionando o subtópico concluído caso esse não esteja presenta na lista de progresso do usuário.
			if (
				!progressState.doneSubtopics.includes(navigationState.currentSubtopic)
			) {
				data.doneSubtopics = [
					...progressState.doneSubtopics,
					navigationState.currentSubtopic,
				];
			}

			// Caso o próximo subtópico a ser realizado não esteja na lista de concluídos, iremos adicioná-lo como o subtópico em progresso do usuário.
			if (!progressState.doneSubtopics.includes(nextSubtopic.slug))
				data.inProgressSubtopic = nextSubtopic.slug;

			// Validando se o tópico foi concluído. Caso positivo, iremos adicioná-lo à lista de progresso do usuário.
			const isTopicDone = subtopics.every((subtopic) =>
				data.doneSubtopics?.includes(subtopic.slug),
			);

			if (
				isTopicDone &&
				!progressState.doneTopics.includes(navigationState.currentTopic)
			) {
				data.doneTopics = [
					...new Set([
						...progressState.doneTopics,
						navigationState.currentTopic,
					]),
				];
				data.inProgressTopic = nextTopic.slug;
			}

			progressDispatch({
				type: progressActionTypes.SET_PROGRESS,
				payload: data,
			});
			await updateDoc(doc(db, 'userProgress', authState.uid), data);
		} catch (error) {
			logError(error);
		}
	};

	const handlePrevious = async () => {
		window.scrollTo({ top: 0, behavior: 'smooth' });

		navigationDispatch({
			type: navegationActionTypes.SET_IS_LAST_SUBTOPIC,
			payload: false,
		});

		const previousSubtopic = subtopics.find(
			(subtopic) => subtopic.order === subtopicData.order - 1,
		);

		if (previousSubtopic) {
			navigationDispatch({
				type: navegationActionTypes.SET_CURRENT_PROGRESS,
				payload: { currentSubtopic: previousSubtopic.slug },
			});
			return;
		}

		// Caso o subtópico anterior não exista, iremos obter o último subtópico do tópico anterior:
		const previousTopic = topics.find(
			(topic) => topic.order === topicData.order - 1,
		);
		if (!previousTopic) return;

		const previousSubtopics = previousTopic.subtopics.map(
			(subtic) => subtic.fields,
		);
		const newSubtopic = previousSubtopics.find(
			(subtopic) => subtopic.order === previousSubtopics.length,
		);

		navigationDispatch({
			type: navegationActionTypes.SET_CURRENT_PROGRESS,
			payload: {
				currentTopic: previousTopic.slug,
				currentSubtopic: newSubtopic.slug,
			},
		});
	};

	const finishModule = async () => {
		navigate('/learning-path');

		if (progressState.doneModules.includes(params.moduleId)) return;

		const { nextModule, nextSubtopic, nextTopic } = await getNextContent(
			moduleData,
			topicData,
			subtopicData,
		);

		const data = {
			doneSubtopics: [
				...progressState.doneSubtopics,
				navigationState.currentSubtopic,
			],
			doneTopics: [...progressState.doneTopics, navigationState.currentTopic],
			doneModules: [...progressState.doneModules, params.moduleId],
			inProgressModule: nextModule.slug,
			inProgressTopic: nextTopic.slug,
			inProgressSubtopic: nextSubtopic.slug,
		};

		progressDispatch({
			type: progressActionTypes.SET_PROGRESS,
			payload: data,
		});
		navigationDispatch({
			type: navegationActionTypes.SET_CURRENT_PROGRESS,
			payload: {
				currentModule: nextModule.slug,
				currentTopic: nextTopic.slug,
				currentSubtopic: nextSubtopic.slug,
				isLastSubtopic: false,
			},
		});
		await updateDoc(doc(db, 'userProgress', authState.uid), data);
	};

	return (
		<div className="flex justify-end gap-x-10">
			<button
				type="button"
				className={`module-btn group ${navigationState.currentSubtopic.order === 0 ? 'cursor-not-allowed' : 'cursor-pointer'}`}
				disabled={navigationState.currentSubtopic.order === 0}
				onClick={handlePrevious}
			>
				<img
					src={`/assets/images/icons/left_arrow.png`}
					alt="Voltar"
					className="transition-transform duration-300 group-hover:-translate-x-3"
				/>
				Voltar
			</button>
			{navigationState.isLastSubtopic ? (
				<button
					type="button"
					className={`module-btn group ${navigationState.currentSubtopic.order === 'max' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
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
					className={`module-btn group ${navigationState.currentSubtopic.order === 'max' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
					onClick={handleNext}
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
