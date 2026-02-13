import { client } from './contentfulClient';
import { logError } from '../utils/logger';

// Função responsável por requisitar conteúdo da API do Contentful.
export async function fetchContent({ contentType, include, orderOrSlug }) {
	const query = {
		content_type: contentType, // eslint-disable-line camelcase
		include: include,
		// A consulta é feita através dos campos slug ou order, escolhidos dinamicamente.
		[typeof orderOrSlug === 'number' ? 'fields.order' : 'fields.slug']:
			orderOrSlug,
		order: 'fields.order',
	};
	try {
		const res = await client.getEntries(query);
		return res.items;
	} catch (error) {
		logError(error, 'Não foi possível carregar o conteúdo. Tente novamente.');
		throw error;
	}
}
