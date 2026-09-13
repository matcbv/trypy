import type { ProgressState } from '../types/states';

export function isProgressInitialized(progress: ProgressState) {
	return (
		progress.inProgressModule !== '' &&
		progress.inProgressTopic !== '' &&
		progress.inProgressSubtopic !== ''
	);
}
