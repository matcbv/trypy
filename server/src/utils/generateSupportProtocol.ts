export function supportProtocolGenerator() {
	const chars = '0123456789';

	function generateSupportProtocol(): string {
		let id = 'TPY-';

		while (id.length < 13) {
			if (id.length === 8) id += '-';
			const index = Math.floor(Math.random() * chars.length);
			id += chars[index];
		}

		return id;
	}

	return { generateSupportProtocol };
}
