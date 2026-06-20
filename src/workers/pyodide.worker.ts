import { loadPyodide, type PyodideInterface } from 'pyodide';

interface WorkerRequest {
	type: 'init' | 'run';
	code?: string;
}

let pyodideInstance: PyodideInterface | null = null;

async function initPyodide(): Promise<PyodideInterface> {
	const pyodide = await loadPyodide({
		stdout: (res: string) => {
			self.postMessage({ type: 'stdout', data: res });
		},

		stderr: (res: string) => {
			self.postMessage({ type: 'stderr', data: res });
		},
	});

	return pyodide;
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
	const { type, code } = event.data;

	if (type === 'init') {
		self.postMessage({ type: 'status', status: 'loading' });
		pyodideInstance = await initPyodide();
		self.postMessage({ type: 'status', status: 'ready' });
	}

	if (type === 'run') {
		if (!pyodideInstance) {
			self.postMessage({
				type: 'error',
				data: 'O terminal ainda não foi inicializado. Tente novamente.',
			});
			return;
		}

		self.postMessage({ type: 'status', status: 'running' });

		try {
			await pyodideInstance.runPythonAsync(code!);
			self.postMessage({ type: 'status', status: 'ready' });
		} catch (error) {
			self.postMessage({ type: 'error', data: (error as Error).message });
			self.postMessage({ type: 'status', status: 'ready' });
		}
	}
};
