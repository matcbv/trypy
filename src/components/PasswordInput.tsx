import { useRef, useState, type ChangeEvent, type FocusEvent } from 'react';

interface PasswordInputProps {
	handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
	placeholder: string;
	value: string;
}

export function PasswordInput({
	handleChange,
	value,
	placeholder,
}: PasswordInputProps) {
	const [isVisible, setIsVisible] = useState(false);
	const [hideText, setHideText] = useState(true);
	const wrapperRef = useRef<HTMLDivElement>(null);

	const toggleText = (e: FocusEvent<HTMLInputElement | HTMLImageElement>) => {
		if (wrapperRef.current?.contains(e.relatedTarget)) {
			return;
		}
		setHideText(true);
	};

	return (
		<div ref={wrapperRef}>
			<div className="relative flex items-center">
				<input
					type={isVisible ? 'text' : 'password'}
					id="password"
					onChange={handleChange}
					onFocus={() => setHideText(false)}
					onBlur={toggleText}
					value={value}
					placeholder={placeholder}
					className="focus:border-main-green min-h-[36px] w-full rounded-full border-2 border-white/30 bg-white/5 py-1 pr-9 pl-3 text-base leading-6 placeholder-red-400 transition-colors duration-300 outline-none"
				/>
				<img
					className="absolute right-3 cursor-pointer"
					onClick={() => setIsVisible((prev) => !prev)}
					onBlur={toggleText}
					onFocus={() => setHideText(false)}
					src={`/assets/images/icons/${isVisible ? 'hide' : 'visible'}.png`}
					alt={isVisible ? 'Esconder senha' : 'Exibir senha'}
					role="button"
					tabIndex={0}
				/>
			</div>
			<div
				className={`grid overflow-hidden transition-all duration-300 ${
					hideText ? 'mt-0 grid-rows-[0fr]' : 'mt-2 grid-rows-[1fr]'
				}`}
			>
				<p className="w-full overflow-hidden pl-1 text-[0.7rem] leading-4">
					A senha deve possuir oito caracteres, contendo ao menos uma letra
					maiúscula, uma minúscula e um número.
				</p>
			</div>
		</div>
	);
}
