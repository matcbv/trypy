import type { ProgressState } from '../../types/states';

const initialState = {
	inProgressModule: '',
	inProgressTopic: '',
	inProgressSubtopic: '',
	doneModules: [],
	doneTopics: [],
	doneSubtopics: [],
} as ProgressState;

export default initialState;
