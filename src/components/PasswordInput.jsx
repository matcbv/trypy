import { useRef, useState } from 'react';

export function PasswordInput({ handleChange, userData, placeholders }) {
	const [isVisible, setIsVisible] = useState(false);
	const [hideText, setHideText] = useState(true);
	const wrapperRef = useRef(null);

	const toogleText = (e) => {
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
					onBlur={toogleText}
					value={userData.password}
					placeholder={placeholders.password}
					className="w-[300px] rounded-full border-2 border-white/30 bg-white/5 py-1 pr-9 pl-3 placeholder-red-400 outline-none focus:border-[var(--main-green)]"
				/>
				<img
					className="absolute right-3 cursor-pointer"
					onClick={() => setIsVisible((prev) => !prev)}
					onBlur={toogleText}
					onFocus={() => setHideText(false)}
					src={`/assets/images/icons/${isVisible ? 'hide' : 'visible'}.png`}
					alt={isVisible ? 'Esconder senha' : 'Exibir senha'}
					tabIndex={0}
				/>
			</div>
			<p
				className={`w-[300px] overflow-hidden pl-1 text-[0.7rem] leading-normal transition-all duration-300 ${hideText ? 'mt-0 h-0 opacity-0' : 'mt-2 h-[34px] opacity-100'}`}
			>
				A senha deve possuir oito caracteres, contendo ao menos uma letra
				maiúscula, uma minúscula e um número.
			</p>
		</div>
	);
}
