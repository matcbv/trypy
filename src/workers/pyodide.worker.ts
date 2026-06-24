import { loadPyodide, type PyodideInterface } from 'pyodide';
import type { WorkerRequest, WorkerResponse } from '../types/workers';

let pyodideInstance: PyodideInterface | null = null;

// * Wrapper aplicando tipagem para a mensagem de resposta do worker.
const postMessageWrapper = (message: WorkerResponse) =>
	self.postMessage(message);

// * Função responsável por inicializar o worker.
async function initPyodide(): Promise<PyodideInterface> {
	const pyodide = await loadPyodide({
		stdout: (res: string) => {
			postMessageWrapper({ type: 'stdout', data: res });
		},

		stderr: (res: string) => {
			postMessageWrapper({ type: 'stderr', error: res });
		},
	});

	return pyodide;
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
	const { type, userCode, testCode } = event.data;

	if (type === 'init') {
		postMessageWrapper({ type: 'status', status: 'loading' });
		pyodideInstance = await initPyodide();
		postMessageWrapper({ type: 'status', status: 'ready' });
	}

	if (type === 'run') {
		if (!pyodideInstance) {
			postMessageWrapper({
				type: 'error',
				data: 'O terminal ainda não foi inicializado. Tente novamente em instantes.',
			});
			return;
		}

		postMessageWrapper({ type: 'status', status: 'running' });

		try {
			const fullCode = `${userCode}\n${testCode}`;
			await pyodideInstance.runPythonAsync(fullCode);
			postMessageWrapper({ type: 'status', status: 'success' });
		} catch (error) {
			postMessageWrapper({ type: 'error', error: (error as Error).message });
		} finally {
			postMessageWrapper({ type: 'status', status: 'ready' });
		}
	}
};
