import { toast, type Id } from 'react-toastify';
import { ToastNotification } from '../components/Notifications';
import { firebaseErrorMessages } from '../constants/errorMessages';
import { FirebaseError } from 'firebase/app';
import { DisplayableError } from '../classes/DisplayableError';

interface LogErrorProps {
	error: unknown;
	text?: string;
	toastId?: Id;
}

export interface ToastData {
	text: string;
}

// * Função aplicando type predicate para checagem do código de erro recebido.
export function isKnownError(
	error: unknown,
): error is FirebaseError & { code: keyof typeof firebaseErrorMessages } {
	// * Caso a afirmação abaixo retorne um boolean true, error será tratado como um FirebaseError (tipo exposto pelo Firebase contendo propriedades extras para o erro, como a propriedade code), onde a propriedade code é uma chave conhecida do objeto errorMessages.
	return error instanceof FirebaseError && error.code in firebaseErrorMessages;
}

export const logDev = (error: unknown) => {
	if (!import.meta.env.DEV) return;

	if (error instanceof FirebaseError) {
		console.error(
			`Error code: ${error.code};\n Message: ${error.message};\n Stack: ${error.stack}`,
		);
	} else {
		console.error(error);
	}
};

export const logError = ({ error, text, toastId }: LogErrorProps) => {
	logDev(error);

	toast<ToastData>(ToastNotification, {
		type: 'error',
		data: {
			text:
				text ||
				(error instanceof DisplayableError && error.message) ||
				(isKnownError(error) && firebaseErrorMessages[error.code]) ||
				'Algo deu errado. Tente novamente.',
		},
		...(toastId && { toastId }),
	});
};

export const logSuccess = (text: string) => {
	toast<ToastData>(ToastNotification, {
		type: 'success',
		data: {
			text: text,
		},
	});
};

export const logInfo = (text: string) => {
	toast<ToastData>(ToastNotification, {
		type: 'info',
		data: {
			text: text,
		},
	});
};

export const logWarning = (text: string) => {
	toast<ToastData>(ToastNotification, {
		type: 'warning',
		data: {
			text: text,
		},
	});
};
