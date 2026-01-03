import { toast } from 'react-toastify';
import { ToastNotification } from '../components/Notifications';
import { errorMessages } from './errorMessages';

export const logError = (error, text) => {
	if (import.meta.env.DEV) {
		error &&
			console.error(
				` Error code: ${error.code};\n Message: ${error.message};\n Stack: ${error.stack}`,
			);
	}

	toast(ToastNotification, {
		type: 'error',
		data: {
			type: 'error',
			text: text || errorMessages[error.code] || errorMessages.default,
		},
	});
};

export const logInfo = (text) => {
	if (import.meta.env.DEV) {
		console.log(text);
	}
};
