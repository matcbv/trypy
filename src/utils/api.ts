import axios from 'axios';
import type { ApiError } from '../types/api';

import { logError } from './logger';

export const logApiError = (error: unknown) => {
	if (axios.isAxiosError<ApiError>(error)) {
		const message = error.response?.data?.error;

		if (message) {
			logError({ error, text: message });
			return;
		}
	}

	logError({ error });
};
