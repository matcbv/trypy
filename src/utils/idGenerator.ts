export function idGenerator(): { generateId: () => string } {
	const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ0123456789';

	function generateId(): string {
		let id = '';

		while (id.length < 6) {
			const index = Math.floor(Math.random() * chars.length);
			id += chars[index];
		}

		return id;
	}

	return { generateId };
}
