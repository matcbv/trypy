import type { ToastContentProps } from 'react-toastify';
import type { ToastData } from '../types/toast';

export function ToastNotification({ data }: ToastContentProps<ToastData>) {
	return (
		<div className="flex items-center gap-x-3">
			<img
				src={`/assets/images/icons/${data.type}.png`}
				alt={data.type}
				className="w-[25px]"
			/>
			<p className="font-jetbrains text-sm leading-6 font-bold text-white">
				{data.text}
			</p>
		</div>
	);
}
