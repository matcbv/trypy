import type { TipSkeleton } from '../../types/skeletons';
import { CodeBlock } from '../../components/CodeBlock';
import { TipPy } from '../../components/TipPy';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import type { ResolvedAsset, ResolvedEntry } from '../../types/richText';
import type { EntrySkeletonType } from 'contentful';
import {
	BLOCKS,
	MARKS,
	type AssetLinkBlock,
	type Document,
	type EntryLinkBlock,
	type Paragraph,
	type Text,
} from '@contentful/rich-text-types';

type ResolvedEntryBlock<T extends EntrySkeletonType> = Omit<
	EntryLinkBlock,
	'data'
> & {
	data: {
		target: ResolvedEntry<T>;
	};
};

type ResolvedEntryAsset = Omit<AssetLinkBlock, 'data'> & {
	data: {
		target: ResolvedAsset;
	};
};

export function contentfulFormatter(content: Document) {
	return documentToReactComponents(content, {
		renderNode: {
			[BLOCKS.EMBEDDED_ENTRY]: (node) => {
				const entry = node as ResolvedEntryBlock<TipSkeleton>;
				if (entry) {
					return <TipPy tipFields={entry.data.target.fields} />;
				}
			},
			[BLOCKS.UL_LIST]: (_, children) => (
				<ul
					className={`ml-5 flex list-disc flex-col gap-y-2 marker:text-(--theme-color)`}
				>
					{children}
				</ul>
			),
			[BLOCKS.HEADING_2]: (_, children) => (
				<h2 className={`text-content-h2 tracking-wide text-(--theme-color)`}>
					{children}
				</h2>
			),
			[BLOCKS.HEADING_3]: (_, children) => (
				<h3 className="text-content-h3 tracking-wide">{children}</h3>
			),
			[BLOCKS.HR]: () => <hr className="my-8" />,
			[BLOCKS.PARAGRAPH]: (node, children) => {
				const paragraph = node as Paragraph;
				const text = paragraph.content[0] as Text;

				const isOnlyCode =
					paragraph.content.length === 1 &&
					text.marks.some((mark) => mark.type === 'code');

				if (isOnlyCode) {
					return <CodeBlock code={text.value} />;
				}

				return <p className="text-content-p">{children}</p>;
			},
			[BLOCKS.EMBEDDED_ASSET]: (node) => {
				const asset = node as ResolvedEntryAsset;
				const { title, file } = asset.data.target.fields;
				if (!file) return;

				return (
					<img
						src={file.url}
						alt={title}
						className="size-[400px] self-center opacity-80"
						draggable={false}
					/>
				);
			},
		},
		renderMark: {
			[MARKS.BOLD]: (text) => (
				<span className="text-(--highlight-theme-color)">{text}</span>
			),
		},
	});
}
