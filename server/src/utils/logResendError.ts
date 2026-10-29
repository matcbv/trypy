export function logResendError(
	context: string,
	error: { name: string; message: string; statusCode?: number | null },
) {
	console.error(`[${context}] falha no Resend`, {
		name: error.name,
		message: error.message,
		statusCode: error.statusCode,
	});
}
