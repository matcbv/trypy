export function idGenerator(): { generateID: () => string } {
	const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ0123456789';

	function generateID(): string {
		let id = '';

		while (id.length < 8) {
			const index = Math.floor(Math.random() * chars.length);
			id += chars[index];
		}

		return id;
	}

	return { generateID };
}
