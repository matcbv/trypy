import { toast } from 'react-toastify';
import { ToastNotification } from '../components/Notifications';
import { errorMessages } from '../constants/errorMessages';
import { FirebaseError } from 'firebase/app';
import type { ToastData } from '../types/toast';

export const logError = (error: unknown, text?: string) => {
	if (import.meta.env.DEV && error instanceof FirebaseError) {
		console.error(
			`Error code: ${error.code};\n Message: ${error.message};\n Stack: ${error.stack}`,
		);
	}

	// * Função aplicando type predicate para checagem do código de erro recebido.
	function isKnownError(
		error: unknown,
	): error is FirebaseError & { code: keyof typeof errorMessages } {
		// * Caso a afirmação abaixo retorne um boolean true, error será tratado como um FirebaseError (tipo exposto pelo Firebase contendo propriedades extras para o erro, como a propriedade code), onde a propriedade code é uma chave conhecida do objeto errorMessages.
		return error instanceof FirebaseError && error.code in errorMessages;
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

export const logInfo = (text: string) => {
	if (import.meta.env.DEV) {
		console.log(text);
	}
};
