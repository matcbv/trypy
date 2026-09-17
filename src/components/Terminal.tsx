import { useSafeContext } from '../hooks/useSafeContext';
import { TerminalContext } from '../contexts/TerminalProvider/context';
import { useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { catppuccinFrappe } from '@catppuccin/codemirror';
import { LoadingPage } from '../pages/LoadingPage';
import type { SubtopicData } from '../types/content';
import { ProgressContext } from '../contexts/ProgressProvider/context';
import { writeBatch } from 'firebase/firestore';
import { userDataRef, userProgressRef } from '../database/refs/userRefs';
import { AuthContext } from '../contexts/AuthProvider/context';
import { logError, logSuccess } from '../utils/logger';
import { db } from '../database/configs/firebase';

export function Terminal({ subtopicData }: { subtopicData: SubtopicData }) {
	const { authState } = useSafeContext(AuthContext);
	const { progressState, setProgressState } = useSafeContext(ProgressContext);
	const { terminalState, setTerminalState, runCode, stopCodeExecution } =
		useSafeContext(TerminalContext);
	const [userCode, setUserCode] = useState<string>('');

	const solved =
		terminalState.solved ||
		progressState.doneSubtopics.includes(subtopicData.slug);

	// * useEffect responsável pela conclusão do exercício resolvido
	useEffect(() => {
		if (
			terminalState.solved &&
			!progressState.doneSubtopics.includes(subtopicData.slug)
		) {
			void (async () => {
				try {
					const doneSubtopics = [
						...progressState.doneSubtopics,
						subtopicData.slug,
					];

					setProgressState((prev) => ({
						...prev,
						doneSubtopics,
					}));

					const resolutions = [
						...authState.data!.resolutions,
						{
							slug: subtopicData.slug,
							title: subtopicData.title,
							code: userCode,
						},
					];

					if (authState.uid) {
						const batch = writeBatch(db);
						batch.update(userDataRef(authState.uid), { resolutions });
						batch.update(userProgressRef(authState.uid), { doneSubtopics });
						await batch.commit();
					}

					setTerminalState((prev) => ({ ...prev, solved: false }));
					logSuccess('Exercício resolvido com sucesso!');
				} catch (error) {
					logError({
						error,
						text: 'Não foi possível seguir com a conclusão do exercício. Tente novamente.',
					});
				}
			})();
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [terminalState.solved]);

	// * useEffect para limpeza do output ao navegar entrem módulos.
	useEffect(() => {
		setTerminalState((prev) => ({
			...prev,
			output: null,
			error: null,
			solved: false,
		}));
		setUserCode(subtopicData.starterCode || '');
	}, [subtopicData, setTerminalState]);

	const statusIcon = () => {
		if (!terminalState.output && !terminalState.error) return;

		if (terminalState.status === 'running') {
			return (
				<img src={`/assets/images/loading.png`} alt="Status" className="w-5" />
			);
		}

		return (
			<img
				src={`/assets/images/icons/${terminalState.error ? 'warning' : 'success'}.png`}
				alt="Status"
				className="w-5"
			/>
		);
	};

	return (
		<div className="flex flex-col">
			<div className="mb-6 flex">
				<p className="mr-2 text-lg tracking-wide">Status do exercício:</p>
				<span className="flex items-center gap-x-1 font-bold">
					{solved ? 'Finalizado' : 'Em progresso...'}
					<img
						src={`/assets/images/icons/${solved ? 'success' : 'loading'}.png`}
						alt="Status"
						className="w-5"
					/>
				</span>
			</div>
			<div className="mb-4 flex gap-x-6">
				<button
					onClick={() =>
						runCode({
							userCode,
							testCode: null,
							expectedOutput: null,
						})
					}
					className="lg:hover:bg-glow-green/20 flex gap-x-1 rounded-md border border-white/50 bg-white/10 px-4 py-2 lg:cursor-pointer lg:transition-colors lg:duration-300"
				>
					Executar
					<img
						src="/assets/images/icons/run.png"
						role="button"
						tabIndex={0}
						alt="Executar código"
					/>
				</button>
				<button
					onClick={stopCodeExecution}
					className="lg:hover:bg-main-red/20 flex gap-x-1 rounded-md border border-white/50 bg-white/10 px-4 py-2 lg:cursor-pointer lg:transition-colors lg:duration-300"
				>
					Interromper
					<img
						src="/assets/images/icons/stop.png"
						role="button"
						tabIndex={0}
						alt="Executar código"
					/>
				</button>
			</div>
			<div className="flex w-full flex-col gap-y-1">
				<div className="relative h-100">
					{terminalState.status === 'loading' ? (
						<LoadingPage />
					) : (
						<CodeMirror
							value={userCode}
							extensions={[python()]}
							theme={catppuccinFrappe}
							height="400px"
							className="overflow-hidden rounded-t-md [&_.cm-scroller]:scrollbar-none"
							onChange={(value) => setUserCode(value)}
						></CodeMirror>
					)}
				</div>
				<div className="bg-terminal-background rounded-b-md">
					<div className="border-main-purple font-jetbrains flex items-center gap-x-2 border-b px-5 py-2 text-sm">
						Saída:
						{statusIcon()}
					</div>
					<div className="codeScrollbar h-50 overflow-scroll px-5 py-2">
						<code className="text-sm whitespace-pre-wrap">
							{terminalState.error || terminalState.output}
						</code>
					</div>
				</div>
			</div>
		</div>
	);
}
