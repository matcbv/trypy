// * Tipos de dados utilizados para trabalhar com o Firebase.

export interface UserData {
	id: string;
	email: string;
	name: string;
	lastname: string | null;
	birthDate: string | null;
	picture: string | null;
	createdAt: Date;
	supporter: boolean;
	resolutions: { slug: string; title: string; code: string }[];
}
