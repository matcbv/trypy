import { AuthContext } from '../contexts/AuthProvider/context';
import { getNextContent } from '../content/navigation/getNextContent';
import { logError, logInfo, logSuccess } from '../utils/logger';
import { ProgressContext } from '../contexts/ProgressProvider/context';
import { useNavigate, useParams } from 'react-router-dom';
import { writeBatch } from 'firebase/firestore';
import { NavigationContext } from '../contexts/NavigationProvider/context';
import { useSafeContext } from '../hooks/useSafeContext';
import type { ModuleData, SubtopicData, TopicData } from '../types/content';
import { userNavigationRef, userProgressRef } from '../database/refs/userRefs';
import { type MouseEvent } from 'react';
import { TerminalContext } from '../contexts/TerminalProvider/context';
import { ContentfulContentContext } from '../contexts/ContentfulContentProvider/context';
import { db } from '../database/configs/firebase';

interface ModuleButtonsProps {
	moduleData: ModuleData;
	topicData: TopicData;
	subtopicData: SubtopicData;
}

export function ModuleButtons({
	moduleData,
	topicData,
	subtopicData,
}: ModuleButtonsProps) {
	const { authState } = useSafeContext(AuthContext);
	const { modules } = useSafeContext(ContentfulContentContext);
	const { progressState, setProgressState } = useSafeContext(ProgressContext);
	const { setNavigationState } = useSafeContext(NavigationContext);
	const { terminalState } = useSafeContext(TerminalContext);
	const params = useParams<{ moduleId: string }>();
	const navigate = useNavigate();

	const isNextButtonLocked =
		subtopicData.subtopicType === 'exercise' &&
		!progressState.doneSubtopics.includes(subtopicData.slug) &&
		!terminalState.solved;

	const handleNext = (e: MouseEvent<HTMLButtonElement>) => {
		if (isNextButtonLocked) {
			e.preventDefault();
			logInfo(
				'Conclua o exercício proposto para avançar ao próximo subtópico.',
			);
			return;
		}

		const data = { ...progressState };

		const { nextTopic, nextSubtopic } = getNextContent({
			modules: modules!,
			currentModuleData: moduleData,
			currentTopicData: topicData,
			currentSubtopicData: subtopicData,
		});

		const isSubtopicDone = progressState.doneSubtopics.includes(
			subtopicData.slug,
		);

		// * Adicionando o subtópico concluído à lista de progresso do usuário, caso não esteja presente.
		if (!isSubtopicDone) {
			data.doneSubtopics = [...progressState.doneSubtopics, subtopicData.slug];
		}

		// * Validando se o tópico foi concluído.
		const isTopicDone = topicData.subtopics.every((subtopic) =>
			data.doneSubtopics?.includes(subtopic.slug),
		);

		// * Caso concluído e não presente na lista de tópicos concluídos, iremos adicioná-lo à ela.
		if (isTopicDone && !progressState.doneTopics.includes(topicData.slug)) {
			data.doneTopics = [...progressState.doneTopics, topicData.slug];
			data.inProgressTopic = nextTopic.slug;
		}

		// * Checando se o próximo subtópico está bloqueado.
		const isNextSubtopicBlocked =
			!isTopicDone &&
			nextTopic.slug !== topicData.slug &&
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
			logInfo('Finalize todos os subtópicos do tópico atual para concluí-lo.');
			return;
		}

		if (!isSubtopicDone) setProgressState((prev) => ({ ...prev, ...data }));

		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const handlePrevious = () => {
		const isFirstSubtopic =
			subtopicData.slug === moduleData.topics[0]?.subtopics[0]?.slug;
		if (isFirstSubtopic) return;

		window.scrollTo({ top: 0, behavior: 'smooth' });

		const previousSubtopic = topicData.subtopics.find(
			(subtopic) => subtopic.order === subtopicData.order - 1,
		);

		if (previousSubtopic) {
			setNavigationState((prev) => ({
				...prev,
				[moduleData.order]: {
					...prev![moduleData.order]!,
					currentSubtopic: previousSubtopic.slug,
				},
			}));
			return;
		}

		// * Caso o subtópico anterior não exista, iremos obter o último subtópico do tópico anterior:
		const previousTopic = moduleData.topics.find(
			(topic) => topic.order === topicData.order - 1,
		);

		const previousSubtopics = previousTopic!.subtopics.map(
			(subtopic) => subtopic,
		);

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

		const isConclusionUnlocked = topicData.subtopics
			.filter((subtopic) => subtopic.subtopicType !== 'conclusion')
			.every((subtopic) => progressState.doneSubtopics.includes(subtopic.slug));

		if (!isConclusionUnlocked) {
			logInfo('Finalize todos os subtópicos para concluir o módulo.');
			return;
		}

		const { nextModule, nextSubtopic, nextTopic } = getNextContent({
			modules: modules!,
			currentModuleData: moduleData,
			currentTopicData: topicData,
			currentSubtopicData: subtopicData,
		});

		if (!progressState.doneModules.includes(params.moduleId)) {
			const data = {
				doneSubtopics: [...progressState.doneSubtopics, subtopicData.slug],
				doneTopics: [...progressState.doneTopics, topicData.slug],
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

			if (authState.uid) {
				try {
					const batch = writeBatch(db);
					batch.update(userProgressRef(authState.uid), data);
					batch.update(userNavigationRef(authState.uid), nextModuleValue);
					await batch.commit();
				} catch (error) {
					logError({
						error,
						text: 'Não foi possível salvar seu progresso. Tente novamente.',
					});
					return;
				}
			}

			setProgressState((prev) => ({ ...prev, ...data }));
			setNavigationState((prev) => ({
				...prev,
				...nextModuleValue,
			}));

			logSuccess('Módulo finalizado com sucesso!');
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
		<div className="flex justify-end gap-x-[25px]">
			<button
				type="button"
				className="module-btn group"
				onClick={handlePrevious}
			>
				<img
					src={`/assets/images/icons/left-arrow.png`}
					alt="Voltar"
					className="lg:transition-transform lg:duration-300 lg:group-hover:-translate-x-2"
				/>
				Voltar
			</button>
			{subtopicData.subtopicType === 'conclusion' ? (
				<button
					type="button"
					className={`module-btn group`}
					onClick={() => void finishModule()}
				>
					Concluir
					<img
						src={`/assets/images/icons/done.png`}
						alt="Concluir"
						className="lg:transition-transform lg:duration-300 lg:group-hover:scale-105"
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
						src={`/assets/images/icons/right-arrow.png`}
						alt="Avançar"
						className="lg:transition-transform lg:duration-300 lg:group-hover:translate-x-2"
					/>
				</button>
			)}
		</div>
	);
}
