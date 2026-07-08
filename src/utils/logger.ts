import { toast } from 'react-toastify';
import { ToastNotification } from '../components/Notifications';
import { errorMessages } from '../constants/errorMessages';
import { FirebaseError } from 'firebase/app';
import type { ToastData } from '../types/toast';

interface LogErrorProps {
	error?: unknown;
	text?: string;
}

// * Função aplicando type predicate para checagem do código de erro recebido.
function isKnownError(
	error: unknown,
): error is FirebaseError & { code: keyof typeof errorMessages } {
	// * Caso a afirmação abaixo retorne um boolean true, error será tratado como um FirebaseError (tipo exposto pelo Firebase contendo propriedades extras para o erro, como a propriedade code), onde a propriedade code é uma chave conhecida do objeto errorMessages.
	return error instanceof FirebaseError && error.code in errorMessages;
}

export const logError = ({ error, text }: LogErrorProps) => {
	if (import.meta.env.DEV && error instanceof FirebaseError) {
		console.error(
			`Error code: ${error.code};\n Message: ${error.message};\n Stack: ${error.stack}`,
		);
	}

	toast<ToastData>(ToastNotification, {
		type: 'error',
		data: {
			type: 'error',
			text:
				text ||
				(isKnownError(error) && errorMessages[error.code]) ||
				errorMessages.default,
		},
	});
};

export const logSuccess = (text: string) => {
	toast<ToastData>(ToastNotification, {
		type: 'success',
		data: {
			type: 'success',
			text: text,
		},
	});
};

export const logInfo = (text: string) => {
	toast<ToastData>(ToastNotification, {
		type: 'info',
		data: {
			type: 'info',
			text: text,
		},
	});
};

export const logWarning = (text: string) => {
	toast<ToastData>(ToastNotification, {
		type: 'warning',
		data: {
			type: 'warning',
			text: text,
		},
	});
};
