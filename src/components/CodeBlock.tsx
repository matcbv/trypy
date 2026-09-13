import { useMemo, useRef, useState } from 'react';
import { highlightCode } from '../lib/shiki';

export function CodeBlock({ code }: { code: string }) {
	const copyIcon = useRef<HTMLImageElement>(null);
	const [isCopied, setIsCopied] = useState(false);
	const codeBlockWrapperRef = useRef<HTMLDivElement>(null);

	const html = useMemo(
		() =>
			highlightCode(code).replace(
				/>(\.\.\.|>>>)/g,
				'><span class="text-[#81c8be] select-none">$1 </span>',
			),
		[code],
	);

	const copyText = async (text: string) => {
		await navigator.clipboard.writeText(text);
		setIsCopied((prev) => !prev);
		setTimeout(() => {
			setIsCopied(false);
		}, 2000);
	};

	return (
		<div
			ref={codeBlockWrapperRef}
			className="group relative shadow-[0_0_10px_var(--color-main-purple)]/15"
		>
			<div className="codeScrollbar overflow-x-auto rounded-lg">
				<div
					className="text-content-p w-fit min-w-full"
					dangerouslySetInnerHTML={{ __html: html }}
				></div>
			</div>

			<img
				ref={copyIcon}
				src={`${isCopied ? '/assets/images/icons/success.png' : '/assets/images/icons/copy.png'}`}
				alt="Copiar código"
				className={`absolute top-[3px] right-[3px] w-5 lg:top-[7px] lg:right-[7px] lg:scale-0 lg:cursor-pointer lg:transition-transform lg:group-hover:scale-100`}
				onClick={() => void copyText(code)}
			/>
		</div>
	);
}
