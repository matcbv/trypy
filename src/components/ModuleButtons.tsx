import { getNextContent } from '../content/navigation/getNextContent';
import { logError, logInfo, logSuccess } from '../utils/logger';
import { ProgressContext } from '../contexts/ProgressProvider/context';
import { useNavigate, useParams } from 'react-router-dom';
import {
	arrayUnion,
	updateDoc,
	writeBatch,
	type PartialWithFieldValue,
} from 'firebase/firestore';
import { NavigationContext } from '../contexts/NavigationProvider/context';
import { useSafeContext } from '../hooks/useSafeContext';
import type { ModuleData, SubtopicData, TopicData } from '../types/content';
import { userNavigationRef, userProgressRef } from '../database/refs/userRefs';
import { TerminalContext } from '../contexts/TerminalProvider/context';
import { ContentfulContentContext } from '../contexts/ContentfulContentProvider/context';
import { auth, db } from '../database/configs/firebase';
import type { ProgressState } from '../types/states';

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

	const isConclusionLocked =
		subtopicData.subtopicType === 'conclusion' &&
		topicData.subtopics
			.filter((subtopic) => subtopic.subtopicType !== 'conclusion')
			.some((subtopic) => !progressState.doneSubtopics.includes(subtopic.slug));

	const handleNext = async () => {
		if (isNextButtonLocked) {
			logInfo(
				'Conclua o exercício proposto para avançar ao próximo subtópico.',
			);
			return;
		}
		if (isConclusionLocked) {
			logInfo('Finalize todos os subtópicos para concluir o módulo.');
			return;
		}

		const { nextTopic, nextSubtopic } = getNextContent({
			modules: modules!,
			currentModuleData: moduleData,
			currentTopicData: topicData,
			currentSubtopicData: subtopicData,
		});

		const isSubtopicDone = progressState.doneSubtopics.includes(
			subtopicData.slug,
		);

		// * Validando se o tópico foi concluído.
		const isTopicDone = topicData.subtopics.every((subtopic) =>
			[...progressState.doneSubtopics, subtopicData.slug].includes(
				subtopic.slug,
			),
		);

		// * Checando se o próximo subtópico está bloqueado.
		const isNextSubtopicBlocked =
			!isTopicDone && nextTopic.slug !== topicData.slug;

		if (isNextSubtopicBlocked) {
			logInfo('Finalize todos os subtópicos do tópico atual para concluí-lo.');
			return;
		}

		// * Setando o próximo subtópico no estado de navegação do usuário:
		setNavigationState((prev) => ({
			...prev,
			[moduleData.slug]: {
				currentTopic: nextTopic.slug,
				currentSubtopic: nextSubtopic.slug,
			},
		}));

		if (isSubtopicDone) {
			window.scrollTo(0, 0);
			return;
		}

		// * Dados atualizados para o firebase:
		const firestoreUpdate: PartialWithFieldValue<ProgressState> = {};
		// * Dados atualizados para estado local:
		const localUpdate: Partial<ProgressState> = {};

		// * Adicionando o subtópico concluído à lista de progresso do usuário.
		firestoreUpdate.doneSubtopics = arrayUnion(subtopicData.slug);
		localUpdate.doneSubtopics = [
			...progressState.doneSubtopics,
			subtopicData.slug,
		];

		// * Em caso do tópico ter sido concluído e não esteja presente na lista de concluídos, iremos adicioná-lo à ela.
		if (isTopicDone && !progressState.doneTopics.includes(topicData.slug)) {
			firestoreUpdate.doneTopics = arrayUnion(topicData.slug);
			localUpdate.doneTopics = [...progressState.doneTopics, topicData.slug];
			firestoreUpdate.inProgressTopic = localUpdate.inProgressTopic =
				nextTopic.slug;
		}

		// * Caso o subtópico não esteja presenta na listas de concluídos, será adicioná-lo a ela.
		if (!progressState.doneSubtopics.includes(nextSubtopic.slug)) {
			firestoreUpdate.inProgressSubtopic = localUpdate.inProgressSubtopic =
				nextSubtopic.slug;

			firestoreUpdate.lastActivityAt = localUpdate.lastActivityAt = new Date();
		}

		const user = auth.currentUser;

		if (user?.emailVerified) {
			try {
				await updateDoc(userProgressRef(user.uid), firestoreUpdate);
				setProgressState((prev) => ({ ...prev, ...localUpdate }));
			} catch (error) {
				logError({
					text: 'Não foi possível concluir o subtópico. Tente novamente.',
					error,
				});
			}
			window.scrollTo(0, 0);
			return;
		}
		setProgressState((prev) => ({ ...prev, ...localUpdate }));

		window.scrollTo(0, 0);
	};

	const handlePrevious = () => {
		const isFirstSubtopic =
			subtopicData.slug === moduleData.topics[0]?.subtopics[0]?.slug;
		if (isFirstSubtopic) return;

		window.scrollTo(0, 0);

		const previousSubtopic = topicData.subtopics.find(
			(subtopic) => subtopic.order === subtopicData.order - 1,
		);

		if (previousSubtopic) {
			setNavigationState((prev) => ({
				...prev,
				[moduleData.slug]: {
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

		const lastTopicSubtopic = previousSubtopics.find(
			(subtopic) => subtopic.order === previousSubtopics.length,
		);

		setNavigationState((prev) => ({
			...prev,
			[moduleData.slug]: {
				currentTopic: previousTopic!.slug,
				currentSubtopic: lastTopicSubtopic!.slug,
			},
		}));
	};

	const finishModule = async () => {
		if (!params.moduleId) return;

		const { nextModule, nextSubtopic, nextTopic } = getNextContent({
			modules: modules!,
			currentModuleData: moduleData,
			currentTopicData: topicData,
			currentSubtopicData: subtopicData,
		});

		if (progressState.doneModules.includes(params.moduleId)) {
			void navigate('/learning-path');
			return;
		}

		const progressUpdate = {
			doneSubtopics: [...progressState.doneSubtopics, subtopicData.slug],
			doneTopics: [...progressState.doneTopics, topicData.slug],
			doneModules: [...progressState.doneModules, params.moduleId],
			inProgressModule: nextModule.slug,
			inProgressTopic: nextTopic.slug,
			inProgressSubtopic: nextSubtopic.slug,
		};

		const navigationUpdate = {
			[nextModule.slug]: {
				currentTopic: nextTopic.slug,
				currentSubtopic: nextSubtopic.slug,
			},
		};

		const user = auth.currentUser;

		if (user?.emailVerified) {
			try {
				const batch = writeBatch(db);
				batch.set(userProgressRef(user.uid), progressUpdate);
				batch.update(userNavigationRef(user.uid), navigationUpdate);
				await batch.commit();
			} catch (error) {
				logError({
					error,
					text: 'Não foi possível salvar seu progresso. Tente novamente.',
				});
				return;
			}
		}

		setProgressState((prev) => ({ ...prev, ...progressUpdate }));
		setNavigationState((prev) => ({ ...prev, ...navigationUpdate }));

		logSuccess('Módulo finalizado com sucesso!');
		void navigate('/learning-path');
	};

	return (
		<div className="flex justify-end gap-x-6">
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
						className="w-6 lg:transition-transform lg:duration-300 lg:group-hover:scale-105"
					/>
				</button>
			) : (
				<button
					type="button"
					className={`module-btn group`}
					onClick={() => void handleNext()}
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
