import { useSafeContext } from '../hooks/useSafeContext';
import { TerminalContext } from '../contexts/TerminalProvider/context';
import { useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { LoadingPage } from '../pages/LoadingPage';
import type { SubtopicData } from '../types/content';
import { ProgressContext } from '../contexts/ProgressProvider/context';
import { toast } from 'react-toastify';
import type { ToastData } from '../types/toast';
import { ToastNotification } from './Notifications';
import { updateDoc } from 'firebase/firestore';
import { userProgressRef } from '../database/refs/userRefs';
import { AuthContext } from '../contexts/AuthProvider/context';
import { logError } from '../utils/logger';

export function Terminal({ subtopicData }: { subtopicData: SubtopicData }) {
	const { authState } = useSafeContext(AuthContext);
	const { progressState, setProgressState } = useSafeContext(ProgressContext);
	const { terminalState, setTerminalState, runCode, stopCodeExecution } =
		useSafeContext(TerminalContext);
	const [userCode, setUserCode] = useState<string>(subtopicData.starterCode!);

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
					await updateDoc(userProgressRef(authState.uid!), { doneSubtopics });

					setTerminalState((prev) => ({ ...prev, solved: false }));

					toast<ToastData>(ToastNotification, {
						type: 'success',
						data: {
							type: 'success',
							text: 'Exercício resolvido com sucesso!',
						},
					});
				} catch (error) {
					logError(
						error,
						'Não foi possível seguir com a conclusão do exercício. Tente novamente.',
					);
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
	}, [subtopicData, setTerminalState]);

	const statusIcon = () => {
		if (!terminalState.output && !terminalState.error) return;

		if (terminalState.status === 'running') {
			return (
				<img
					src={`/assets/images/loading.png`}
					alt="Status"
					className="w-[20px]"
				/>
			);
		}

		return (
			<img
				src={`/assets/images/icons/${terminalState.error ? 'warning' : 'success'}.png`}
				alt="Status"
				className="w-[20px]"
			/>
		);
	};

	return (
		<div className="flex flex-col gap-y-5">
			<div className="flex">
				<p className="text-highlight-green mr-2 text-lg tracking-wide">
					Status do exercício:
				</p>
				<span className="flex items-center gap-x-1 font-bold">
					{solved ? 'Finalizado' : 'Em progresso...'}
					<img
						src={`/assets/images/icons/${solved ? 'success' : 'loading'}.png`}
						alt="Status"
						className="size-[20px]"
					/>
				</span>
			</div>
			<div className="flex w-full flex-col gap-y-1">
				<div className="relative h-[400px]">
					{terminalState.status === 'loading' ? (
						<LoadingPage />
					) : (
						<CodeMirror
							value={userCode}
							extensions={[python()]}
							theme={oneDark}
							height="400px"
							className="overflow-hidden rounded-t-md"
							onChange={(value) => setUserCode(value)}
						></CodeMirror>
					)}
				</div>

				<div className="rounded-b-md bg-[#2a313d]">
					<div className="border-main-purple font-jetbrains flex items-center gap-x-2 border-b px-5 py-2 text-sm">
						Saída:
						{statusIcon()}
					</div>
					<div className="h-[200px] scrollbar-none overflow-scroll px-5 py-2">
						<code className="text-sm whitespace-pre-wrap">
							{terminalState.error || terminalState.output}
						</code>
					</div>
				</div>
			</div>
			<div className="flex gap-x-10">
				<button
					type="button"
					className="border-main-green/60 hover:bg-main-green/20 w-[150px] cursor-pointer rounded-md border bg-white/5 py-3 text-sm tracking-wide text-white transition-colors duration-300"
					onClick={() =>
						runCode({
							userCode,
							testCode: subtopicData.testCode,
							expectedOutput: subtopicData.expectedOutput,
						})
					}
				>
					Executar código
				</button>
				<button
					type="button"
					className="border-main-red/60 hover:bg-main-red/20 w-[150px] cursor-pointer rounded-md border bg-white/5 py-3 text-sm tracking-wide transition-colors duration-300"
					onClick={stopCodeExecution}
				>
					Interromper
				</button>
			</div>
		</div>
	);
}
