export const firebaseErrorMessages = {
	'auth/invalid-credential': 'E-mail ou senha incorretos.',
	'auth/user-not-found': 'Usuário não encontrado.',
	'auth/email-already-in-use': 'E-mail já em uso.',
	'auth/invalid-email': 'E-mail inválido.',
};

export const sharedToasts = {
	sessionError: {
		text: 'Não foi possível renovar a sessão. Faça login novamente.',
		toastId: 'session-error',
	},
	loadDataError: {
		text: 'Não foi possível carregar seus dados. Recarregue a página para tentar novamente.',
		toastId: 'load-user-data-error',
	},
} as const;
