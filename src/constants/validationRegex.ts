export const validationRegex = {
	email: {
		regex: /^\S+@\S+\.com(\.[a-zA-Z]{2,})?$/g,
		text: 'E-mail inválido',
	},
	password: {
		regex: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/g,
		text: 'Senha inválida',
	},
	name: {
		regex: /([^\s]+)/g,
		text: 'Nome é obrigatório',
	},
	lastname: {
		regex: /([^\s]+)/g,
		text: 'Sobrenome é obrigatório',
	},
	birthDate: {
		regex: /^(\d{2})\/(\d{2})\/(\d{4})$/g,
		text: 'Data inválida',
	},
};
