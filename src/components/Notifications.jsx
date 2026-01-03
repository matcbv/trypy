export function ToastNotification({ closeToast, data }) {
	return (
		<div className="flex items-center gap-x-3">
			<img
				src={`/assets/images/icons/${data.type}.png`}
				alt={data.type}
				className="w-[30px]"
			/>
			<p className="font-jetbrains text-sm leading-relaxed font-bold text-white">
				{data.text}
			</p>
			<img
				src="/assets/images/icons/close.png"
				alt="Fechar"
				className="absolute top-2 right-2 w-[18px] cursor-pointer"
				onClick={() => closeToast()}
			/>
		</div>
	);
}
