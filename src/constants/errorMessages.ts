export const firebaseErrorMessages = {
	'auth/invalid-credential': 'E-mail ou senha incorretos.',
	'auth/user-not-found': 'Usuário não encontrado.',
	'auth/email-already-in-use': 'E-mail já em uso.',
	'auth/invalid-email': 'E-mail inválido.',
	'auth/account-exists-with-different-credential':
		'Este e-mail já está associado a outro método de login. Entre com ele para continuar.',
	'auth/user-mismatch': 'Use a mesma conta que você utilizou para entrar.',
	'auth/popup-blocked': 'Permita pop-ups no navegador para continuar.',
	'auth/provider-already-linked':
		'Este método de login já está vinculado à sua conta.',
	'auth/no-such-provider':
		'Este método de login não está vinculado à sua conta.',
	'auth/operation-not-allowed':
		'Este método de login não está habilitado no momento.',
	'auth/requires-recent-login':
		'Por segurança, entre novamente na sua conta e tente outra vez.',
	'auth/credential-already-in-use':
		'Estas credenciais já estão vinculadas a outra conta.',
	'auth/too-many-requests':
		'Muitas tentativas. Aguarde um momento e tente novamente.',
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
