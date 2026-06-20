import type { EntryFieldTypes, EntrySkeletonType } from 'contentful';

// * Tipos de Skeleton para serem utilizados com o Contentful.

export type ModuleSkeleton = EntrySkeletonType<
	{
		title: EntryFieldTypes.Symbol;
		topics: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<TopicSkeleton>>;
		slug: EntryFieldTypes.Symbol;
		order: EntryFieldTypes.Integer;
	},
	'module'
>;

export type TopicSkeleton = EntrySkeletonType<
	{
		title: EntryFieldTypes.Symbol;
		subtopics: EntryFieldTypes.Array<
			EntryFieldTypes.EntryLink<SubtopicSkeleton>
		>;
		slug: EntryFieldTypes.Symbol;
		order: EntryFieldTypes.Integer;
	},
	'topic'
>;

export type SubtopicSkeleton = EntrySkeletonType<
	{
		title: EntryFieldTypes.Symbol;
		content: EntryFieldTypes.RichText;
		videoDescription: EntryFieldTypes.Symbol;
		videoLink: EntryFieldTypes.Symbol;
		slug: EntryFieldTypes.Symbol;
		order: EntryFieldTypes.Integer;
		isExercise: EntryFieldTypes.Boolean;
	},
	'subtopic'
>;

export type ModuleCardSkeleton = EntrySkeletonType<
	{
		title: EntryFieldTypes.Symbol;
		description: EntryFieldTypes.Symbol;
		topicsList: EntryFieldTypes.Array<EntryFieldTypes.Symbol>;
		theme: EntryFieldTypes.Symbol;
		moduleId: EntryFieldTypes.Symbol;
		order: EntryFieldTypes.Integer;
	},
	'moduleCard'
>;

export type TipSkeleton = EntrySkeletonType<
	{
		title: EntryFieldTypes.Symbol;
		content: EntryFieldTypes.RichText;
		slug: EntryFieldTypes.Symbol;
		order: EntryFieldTypes.Integer;
	},
	'tipPy'
>;
