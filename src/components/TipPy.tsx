import { useRef, useState } from 'react';
import { contentfulFormatter } from '../content/formatters/contentfulFormatter';
import type { TipData } from '../types/content';

export function TipPy({ tipFields }: { tipFields: TipData }) {
	const tip = useRef<HTMLDivElement>(null);
	const copyIcon = useRef<HTMLImageElement>(null);
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
			ref={tip}
			className="group mb-5 w-full max-w-[600px] rounded-lg bg-[#181724] shadow-lg"
		>
			<div className="flex items-center border-b border-b-(--theme-color) px-4 py-2">
				<div className="flex gap-2">
					<span className="h-3 w-3 rounded-full bg-red-400/70"></span>
					<span className="h-3 w-3 rounded-full bg-yellow-300/70"></span>
					<span className="h-3 w-3 rounded-full bg-green-400/70"></span>
				</div>
				<span className="text-content-p ml-4">{tipFields.title}</span>
				<div className="group ml-auto flex">
					<img
						ref={copyIcon}
						src={`${isCopied ? '/assets/images/icons/success.png' : '/assets/images/icons/copy.png'}`}
						alt="Copiar código"
						className="w-5 scale-0 cursor-pointer transition-transform group-hover:scale-100"
						onClick={() => void copyText(tip.current!.innerText)}
					/>
				</div>
			</div>
			<div className="flex flex-col gap-y-4 p-4">
				{contentfulFormatter(tipFields.content)}
			</div>
		</div>
	);
}
