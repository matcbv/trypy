import type { Asset, Entry, EntrySkeletonType } from 'contentful';

// * Criando tipos personalizados para nosso conteúdo bruto recebido do Contentful

// Tipo personalizado para entries.
export type ResolvedEntry<T extends EntrySkeletonType> = Entry<
	T,
	'WITHOUT_UNRESOLVABLE_LINKS',
	'pt-br'
>;

// * Tipo personalizado para assets.
export type ResolvedAsset = Asset<'WITHOUT_UNRESOLVABLE_LINKS', 'pt-br'>;
