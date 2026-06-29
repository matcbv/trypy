import { useRef, useState } from 'react';

export function CodeBlock({ code }: { code: string }) {
	const copyIcon = useRef<HTMLImageElement | null>(null);
	const [isCopied, setIsCopied] = useState(false);

	const copyText = async (text: string) => {
		await navigator.clipboard.writeText(text);
		setIsCopied((prev) => !prev);
		setTimeout(() => {
			setIsCopied(false);
		}, 2000);
	};

	return (
		<div
			className="font-jetbrains group relative cursor-pointer rounded bg-[#13121b] p-3 px-6 text-sm shadow-[0_0_15px_#000000]/25"
			onClick={() => void copyText(code)}
		>
			<code className="whitespace-pre-wrap">{code}</code>
			<img
				ref={copyIcon}
				src={`${isCopied ? '/assets/images/icons/success.png' : '/assets/images/icons/copy.png'}`}
				alt="Copiar código"
				className="absolute top-3 right-3 w-5 scale-0 cursor-pointer transition-transform group-hover:scale-100"
			/>
		</div>
	);
}
