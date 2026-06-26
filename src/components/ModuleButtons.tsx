import { AuthContext } from '../contexts/AuthProvider/context';
import { getNextContent } from '../content/navigation/getNextContent';
import { logError } from '../utils/logger';
import { ProgressContext } from '../contexts/ProgressProvider/context';
import { useNavigate, useParams } from 'react-router-dom';
import { updateDoc } from 'firebase/firestore';
import { NavigationContext } from '../contexts/NavigationProvider/context';
import { useSafeContext } from '../hooks/useSafeContext';
import type { ModuleData, SubtopicData, TopicData } from '../types/content';
import type { ProgressState } from '../types/states';
import { userNavigationRef, userProgressRef } from '../database/refs/userRefs';
import { toast } from 'react-toastify';
import type { ToastData } from '../types/toast';
import { ToastNotification } from './Notifications';
import { useEffect, useState, type MouseEvent } from 'react';
import { TerminalContext } from '../contexts/TerminalProvider/context';

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
	const { progressState, setProgressState } = useSafeContext(ProgressContext);
	const { navigationState, setNavigationState } =
		useSafeContext(NavigationContext);
	const { terminalState } = useSafeContext(TerminalContext);
	const params = useParams<{ moduleId: string }>();
	const navigate = useNavigate();
	const [isLastSubtopic, setIsLastSubtopic] = useState(false);

	const isNextButtonLocked =
		subtopicData.isExercise &&
		!progressState.doneSubtopics.includes(subtopicData.slug) &&
		!terminalState.solved;

	// * useEffect responsável por verificar se o subtópico acessado é o último do módulo.
	useEffect(() => {
		if (!moduleData) return;

		const lastSubtopic = moduleData.topics.at(-1)!.subtopics.at(-1)!;
		setIsLastSubtopic(
			navigationState[moduleData.order]?.currentSubtopic === lastSubtopic.slug,
		);
	}, [moduleData, navigationState]);

	const handleNext = async (e: MouseEvent) => {
		if (isNextButtonLocked) {
			e.preventDefault();
			toast<ToastData>(ToastNotification, {
				type: 'info',
				data: {
					type: 'info',
					text: 'Conclua o exercício proposto para avançar ao próximo subtópico.',
				},
			});
			return;
		}

		window.scrollTo({ top: 0, behavior: 'smooth' });

		const data: Partial<ProgressState> = { ...progressState };

		try {
			const { nextTopic, nextSubtopic } = await getNextContent(
				moduleData,
				topicData,
				subtopicData,
			);

			// * Adicionando o subtópico concluído à lista de progresso do usuário, caso não esteja presente.
			if (
				!progressState.doneSubtopics.includes(
					navigationState[moduleData.order]!.currentSubtopic,
				)
			) {
				data.doneSubtopics = [
					...progressState.doneSubtopics,
					navigationState[moduleData.order]!.currentSubtopic,
				];
			}

			// * Validando se o tópico foi concluído.
			const isTopicDone = subtopics.every((subtopic) =>
				data.doneSubtopics?.includes(subtopic.slug),
			);

			// * Caso concluído e não presente na lista de tópicos concluídos, iremos adicioná-lo à ela.
			if (
				isTopicDone &&
				!progressState.doneTopics.includes(
					navigationState[moduleData.order]!.currentTopic,
				)
			) {
				data.doneTopics = [
					...progressState.doneTopics,
					navigationState[moduleData.order]!.currentTopic,
				];

				const secureNextTopic =
					topics.find((topic) => topic.order === topicData.order + 1)?.slug ||
					navigationState[moduleData.order]!.currentTopic;

				data.inProgressTopic = secureNextTopic;
			}

			// * Checando se o próximo subtópico está bloqueado.
			const isNextSubtopicBlocked =
				!isTopicDone &&
				nextTopic.slug !== navigationState[moduleData.order]!.currentTopic &&
				nextTopic.subtopics.some(
					(subtopic) => nextSubtopic.slug === subtopic.slug,
				);

			if (!isNextSubtopicBlocked) {
				// * Caso o próximo subtópico não esteja na lista de concluídos, iremos adicioná-lo como o subtópico em progresso do usuário.
				if (!progressState.doneSubtopics.includes(nextSubtopic.slug)) {
					data.inProgressSubtopic = nextSubtopic.slug;
				}

				setNavigationState((prev) => ({
					...prev,
					[moduleData.order]: {
						currentTopic: nextTopic.slug,
						currentSubtopic: nextSubtopic.slug,
					},
				}));
			} else {
				toast<ToastData>(ToastNotification, {
					type: 'info',
					data: {
						type: 'info',
						text: 'Finalize todos os subtópicos do tópico atual para concluí-lo.',
					},
				});
			}
			setProgressState((prev) => ({ ...prev, ...data }));
			await updateDoc(userProgressRef(authState.uid!), data);
		} catch (error) {
			logError(error);
		}
	};

	const handlePrevious = () => {
		if (subtopicData.slug === topics[0]?.subtopics[0]?.slug) return;

		window.scrollTo({ top: 0, behavior: 'smooth' });

		const previousSubtopic = subtopics.find(
			(subtopic) => subtopic.order === subtopicData.order - 1,
		);

		if (previousSubtopic) {
			setNavigationState((prev) => ({
				...prev,
				[moduleData.order]: {
					...prev[moduleData.order]!,
					currentSubtopic: previousSubtopic.slug,
				},
			}));
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

		setNavigationState((prev) => ({
			...prev,
			[moduleData.order]: {
				currentTopic: previousTopic!.slug,
				currentSubtopic: newSubtopic!.slug,
			},
		}));
	};

	const finishModule = async () => {
		if (!params.moduleId) return;

		const isLastTopicDone = subtopics
			.filter((subtopic) => subtopic.order !== subtopics.length)
			.every((subtopic) => progressState.doneSubtopics.includes(subtopic.slug));

		if (!isLastTopicDone) {
			toast<ToastData>(ToastNotification, {
				type: 'info',
				data: {
					type: 'info',
					text: 'Finalize todos os tópicos para concluir o módulo.',
				},
			});
			return;
		}

		const { nextModule, nextSubtopic, nextTopic } = await getNextContent(
			moduleData,
			topicData,
			subtopicData,
		);

		if (!progressState.doneModules.includes(params.moduleId)) {
			const data = {
				doneSubtopics: [
					...progressState.doneSubtopics,
					navigationState[moduleData.order]!.currentSubtopic,
				],
				doneTopics: [
					...progressState.doneTopics,
					navigationState[moduleData.order]!.currentTopic,
				],
				doneModules: [...progressState.doneModules, params.moduleId],
				inProgressModule: nextModule.slug,
				inProgressTopic: nextTopic.slug,
				inProgressSubtopic: nextSubtopic.slug,
			};

			const nextModuleValue = {
				[nextModule.order]: {
					currentTopic: topicData.slug,
					currentSubtopic: subtopicData.slug,
				},
			};

			setProgressState((prev) => ({ ...prev, ...data }));
			setNavigationState((prev) => ({
				...prev,
				...nextModuleValue,
			}));

			await updateDoc(userProgressRef(authState.uid!), data);
			await updateDoc(userNavigationRef(authState.uid!), nextModuleValue);

			toast<ToastData>(ToastNotification, {
				type: 'success',
				data: {
					type: 'success',
					text: 'Módulo finalizado com sucesso!',
				},
			});
		}

		setNavigationState((prev) => ({
			...prev,
			[nextModule.order]: {
				currentTopic: nextTopic.slug,
				currentSubtopic: nextSubtopic.slug,
			},
		}));

		void navigate('/learning-path');
	};

	return (
		<div className="flex justify-end gap-x-10">
			<button
				type="button"
				className="module-btn group"
				onClick={handlePrevious}
			>
				<img
					src={`/assets/images/icons/left_arrow.png`}
					alt="Voltar"
					className="transition-transform duration-300 group-hover:-translate-x-2"
				/>
				Voltar
			</button>
			{isLastSubtopic ? (
				<button
					type="button"
					className={`module-btn group`}
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
					className={`module-btn group`}
					onClick={(e) => void handleNext(e)}
				>
					Avançar
					<img
						src={`/assets/images/icons/right_arrow.png`}
						alt="Avançar"
						className="transition-transform duration-300 group-hover:translate-x-2"
					/>
				</button>
			)}
		</div>
	);
}
