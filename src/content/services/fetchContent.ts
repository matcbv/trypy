import { client } from '../client/contentfulClient';
import type * as SkeletonTypes from '../../types/skeletons';

// * Interface responsável por definir a query para requisições no Contentful.
interface ContentfulQuery<K> {
	// * O tipo genérico recebido será uma das chaves de SkeletonMap.
	contentType: K;
	include: number;
	order?: number;
	slug?: string;
}

// * Interface responsável por determinar a tipagem a ser utilizada em nossas entries do Contentful.
interface SkeletonsMap {
	module: SkeletonTypes.ModuleSkeleton;
	topic: SkeletonTypes.TopicSkeleton;
	subtopic: SkeletonTypes.SubtopicSkeleton;
	moduleCard: SkeletonTypes.ModuleCardSkeleton;
	tipPy: SkeletonTypes.TipSkeleton;
}

// * Função responsável por requisitar conteúdo da API do Contentful. Iremos utilizar um tipo genérico que estende das chaves do nosso mapa de tipos.
export async function fetchContent<K extends keyof SkeletonsMap>({
	contentType,
	include,
	order,
	slug,
}: ContentfulQuery<K>) {
	const query = {
		content_type: contentType, // eslint-disable-line camelcase
		include: include,
		'fields.order': order,
		'fields.slug': slug,
		// * O campo order define o campo a ser utilizado para ordenação do resultado.
		order: 'fields.order',
	};
	// * Abaixo, iremos acessar o tipo desejado em nosso mapa através do genérico K, que será uma chave válida recebida. Assim, o tipo correto para nossas entries será retornado.
	const res = await client.getEntries<SkeletonsMap[K]>(query);
	return res.items;
}
