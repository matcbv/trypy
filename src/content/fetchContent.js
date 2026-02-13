import { client } from './contentfulClient';
import { logError } from '../utils/logger';

export async function fetchContent({ contentType, include, orderOrSlug }) {
	const query = {
		content_type: contentType, // eslint-disable-line camelcase
		include: include,

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
