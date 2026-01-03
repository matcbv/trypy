import { client } from './contentfulClient';

export async function fetchContent(contentType, include, slug) {
	const res = await client.getEntries({
		content_type: contentType, // eslint-disable-line camelcase
		include: include,
		'fields.slug': slug,
		order: 'fields.order',
	});
	return res.items;
}
