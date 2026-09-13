import type { ToastContentProps } from 'react-toastify';
import type { ToastData } from '../types/toast';

export function ToastNotification({ data }: ToastContentProps<ToastData>) {
	return (
		<div className="flex items-center gap-x-3">
			<img
				src={`/assets/images/icons/${data.type}.png`}
				alt={data.type}
				className="w-6"
			/>
			<p className="font-jetbrains text-xs leading-6 font-bold sm:text-sm">
				{data.text}
			</p>
		</div>
	);
}
