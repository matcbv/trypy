import { AuthContext } from '../contexts/AuthProvider/context';
import { getNextContent } from '../content/navigation/getNextContent';
import { logError } from '../utils/logger';
import { ProgressContext } from '../contexts/ProgressProvider/context';
import progressActionTypes from '../contexts/ProgressProvider/actionTypes';
import { useNavigate, useParams } from 'react-router-dom';
import { updateDoc } from 'firebase/firestore';
import { NavigationContext } from '../contexts/NavigationProvider/context';
import navigationActionTypes from '../contexts/NavigationProvider/actionTypes';
import { useSafeContext } from '../hooks/useSafeContext';
import type { ModuleData, SubtopicData, TopicData } from '../types/content';
import type { ProgressState } from '../types/states';
import { userProgressRef } from '../database/refs/userRefs';

interface ModuleButtonsProps {
	topics: TopicData[];
	subtopics: SubtopicData[];
	moduleData: ModuleData;
	topicData: TopicData;
	subtopicData: SubtopicData;
}

export function ModuleButtons({
	topics,
	subtopics,
	moduleData,
	topicData,
	subtopicData,
}: ModuleButtonsProps) {
	const { authState } = useSafeContext(AuthContext);
	const { progressState, progressDispatch } = useSafeContext(ProgressContext);
	const { navigationState, navigationDispatch } =
		useSafeContext(NavigationContext);
	const params = useParams<{ moduleId: string }>();
	const navigate = useNavigate();

	const handleNext = async () => {
		window.scrollTo({ top: 0, behavior: 'smooth' });

		const data: Partial<ProgressState> = {};

		try {
			const { nextTopic, nextSubtopic, isLastSubtopic } = await getNextContent(
				moduleData,
				topicData,
				subtopicData,
			);

			// * Validando se o novo subtópico é o último do módulo.
			navigationDispatch({
				type: navigationActionTypes.SET_CURRENT_PROGRESS,
				payload: { isLastSubtopic: isLastSubtopic },
			});

			navigationDispatch({
				type: navigationActionTypes.SET_CURRENT_PROGRESS,
				payload: {
					currentTopic: nextTopic.slug || '',
					currentSubtopic: nextSubtopic.slug || '',
				},
			});

			// * Adicionando o subtópico concluído caso esse não esteja presenta na lista de progresso do usuário.
			if (
				!progressState.doneSubtopics.includes(navigationState.currentSubtopic)
			) {
				data.doneSubtopics = [
					...progressState.doneSubtopics,
					navigationState.currentSubtopic,
				];
			}

			// * Caso o próximo subtópico a ser realizado não esteja na lista de concluídos, iremos adicioná-lo como o subtópico em progresso do usuário.
			if (!progressState.doneSubtopics.includes(nextSubtopic.slug))
				data.inProgressSubtopic = nextSubtopic.slug;

			// * Validando se o tópico foi concluído. Caso positivo, iremos adicioná-lo à lista de progresso do usuário.
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
			await updateDoc(userProgressRef(authState.uid!), data);
		} catch (error) {
			logError(error);
		}
	};

	const handlePrevious = () => {
		window.scrollTo({ top: 0, behavior: 'smooth' });

		navigationDispatch({
			type: navigationActionTypes.SET_CURRENT_PROGRESS,
			payload: { isLastSubtopic: false },
		});

		const previousSubtopic = subtopics.find(
			(subtopic) => subtopic.order === subtopicData.order - 1,
		);

		if (previousSubtopic) {
			navigationDispatch({
				type: navigationActionTypes.SET_CURRENT_PROGRESS,
				payload: { currentSubtopic: previousSubtopic.slug },
			});
			return;
		}

		// * Caso o subtópico anterior não exista, iremos obter o último subtópico do tópico anterior:
		const previousTopic = topics.find(
			(topic) => topic.order === topicData.order - 1,
		);

		const previousSubtopics = previousTopic!.subtopics.map((subtic) => subtic);

		const newSubtopic = previousSubtopics.find(
			(subtopic) => subtopic.order === previousSubtopics.length,
		);

		navigationDispatch({
			type: navigationActionTypes.SET_CURRENT_PROGRESS,
			payload: {
				currentTopic: previousTopic!.slug,
				currentSubtopic: newSubtopic!.slug,
			},
		});
	};

	const finishModule = async () => {
		void navigate('/learning-path');

		if (!params.moduleId || progressState.doneModules.includes(params.moduleId))
			return;

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
			type: navigationActionTypes.SET_CURRENT_PROGRESS,
			payload: {
				currentModule: nextModule.slug,
				currentTopic: nextTopic.slug,
				currentSubtopic: nextSubtopic.slug,
				isLastSubtopic: false,
			},
		});
		await updateDoc(userProgressRef(authState.uid!), data);
	};

	return (
		<div className="flex justify-end gap-x-10">
			<button
				type="button"
				className={`module-btn group ${subtopicData?.slug === topics[0]?.subtopics[0]?.slug ? 'cursor-not-allowed' : 'cursor-pointer'}`}
				disabled={subtopicData?.slug === topics[0]?.subtopics[0]?.slug}
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
					className={`module-btn group cursor-pointer`}
					onClick={() => void finishModule()}
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
					className={`module-btn group cursor-pointer`}
					onClick={() => void handleNext()}
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
