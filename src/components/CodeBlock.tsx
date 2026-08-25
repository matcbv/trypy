import { useMemo, useRef, useState } from 'react';
import { highlightCode } from '../utils/highlightCode';

export function CodeBlock({ code }: { code: string }) {
	const copyIcon = useRef<HTMLImageElement>(null);
	const [isCopied, setIsCopied] = useState(false);

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
		<div className="group codeScrollbar relative overflow-x-auto rounded-lg shadow-[0_0_10px_var(--color-main-purple)]/15">
			<div
				className="text-content-p w-fit min-w-full"
				dangerouslySetInnerHTML={{ __html: html }}
			></div>
			<img
				ref={copyIcon}
				src={`${isCopied ? '/assets/images/icons/success.png' : '/assets/images/icons/copy.png'}`}
				alt="Copiar código"
				className="absolute top-3 right-3 w-5 scale-0 cursor-pointer transition-transform group-hover:scale-100"
				onClick={() => void copyText(code)}
			/>
		</div>
	);
}
