import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, MARKS } from '@contentful/rich-text-types';
import { TipPy } from '../components/TipPy';

export function contentfulFormatter(content) {
	if (content) {
		return documentToReactComponents(content, {
			renderNode: {
				[BLOCKS.EMBEDDED_ENTRY]: (node) => {
					const fields = node.data?.target?.fields;
					if (fields) {
						return <TipPy tipFields={fields} />;
					} else {
						return null;
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
					const isOnlyCode =
						node.content.length === 1 &&
						node.content[0].marks.some((mark) => mark.type === 'code');

					if (isOnlyCode) {
						return (
							<pre className="font-jetbrains rounded bg-[#13121b] p-3 px-6 text-sm shadow-[0_0_15px_#0000003d]">
								<code>{node.content[0].value}</code>
							</pre>
						);
					}

					return <p className="leading-relaxed">{children}</p>;
				},
				[BLOCKS.EMBEDDED_ASSET]: (node) => {
					const { title, file } = node.data?.target?.fields || {};
					if (!file) return null;

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
}
