export function idGenerator(): { generateID: () => string } {
	let id = 'TPY-';

	function appendValue(value: number): void {
		const str = String.fromCharCode(value);
		id = id.concat(str);
	}

	function generateID(): string {
		while (id.length < 10) {
			const variant = Math.random();
			if (parseFloat(variant.toFixed(1)) > 0.5) {
				const numericPart = Math.ceil(variant * 9 + 48);
				appendValue(numericPart);
			} else {
				const alfanumericPart = Math.ceil(variant * 25 + 65);
				appendValue(alfanumericPart);
			}
		}
		return id;
	}

	return { generateID };
}
