export const validationRegex = {
	email: {
		regex: /^(?=.{1,254}$)[^\s@]{1,64}@[^\s@]{1,189}(?:\.[^\s@]{2,24})+$/,
		text: 'E-mail inválido',
	},
	password: {
		regex: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,128}$/,
		text: 'Senha inválida',
	},
	confirmPassword: {
		regex: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,128}$/,
		text: 'Senha inválida',
	},
	name: {
		regex: /^(?=.*\S).{1,100}$/,
		text: 'Nome inválido',
	},
	lastname: {
		regex: /^(?=.*\S).{1,100}$/,
		text: 'Sobrenome inválido',
	},
	birthDate: {
		regex: /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
		text: 'Data inválida',
	},
};
