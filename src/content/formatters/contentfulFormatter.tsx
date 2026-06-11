import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import {
	BLOCKS,
	MARKS,
	type AssetLinkBlock,
	type Document,
	type EntryLinkBlock,
	type Paragraph,
	type Text,
} from '@contentful/rich-text-types';
import { TipPy } from '../../components/TipPy';
import type { ResolvedAsset, ResolvedEntry } from '../../types/richText';
import type { EntrySkeletonType } from 'contentful';
import type { TipSkeleton } from '../../types/skeletons';
import { CodeBlock } from '../../components/CodeBlock';

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
				<ul className="ml-5 flex list-disc flex-col gap-y-2 marker:text-[var(--main-green)]">
					{children}
				</ul>
			),
			[BLOCKS.HEADING_2]: (_, children) => (
				<h2 className="text-2xl text-[var(--main-green)]">{children}</h2>
			),
			[BLOCKS.HEADING_3]: (_, children) => (
				<h3 className="text-lg">{children}</h3>
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

				return <p className="leading-6">{children}</p>;
			},
			[BLOCKS.EMBEDDED_ASSET]: (node) => {
				const asset = node as ResolvedEntryAsset;
				const { title, file } = asset.data.target.fields;
				if (!file) return;

				return (
					<img
						src={file.url}
						alt={title}
						className="w-[512px] self-center bg-[radial-gradient(circle,_#00ff002b,_transparent_70%)] opacity-60"
						draggable={false}
					/>
				);
			},
		},
		renderMark: {
			[MARKS.BOLD]: (text) => <span className="text-[#b5fbbe]">{text}</span>,
		},
	});
}
