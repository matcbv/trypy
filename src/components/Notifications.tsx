import type { ToastContentProps } from 'react-toastify';
import type { ToastData } from '../utils/logger';

export function ToastNotification({
	data,
	toastProps,
}: ToastContentProps<ToastData>) {
	return (
		<div className="flex items-center gap-x-3">
			<img
				src={`/assets/images/icons/${toastProps.type}.png`}
				alt={toastProps.type}
				className="w-6"
			/>
			<p className="font-jetbrains text-xs leading-6 font-bold sm:text-sm">
				{data.text}
			</p>
		</div>
	);
}
