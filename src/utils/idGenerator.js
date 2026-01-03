export function idGenerator() {
	let id = 'TPY-';

	function generateID() {
		while (id.length < 10) {
			const variant = Math.random();
			if (variant.toFixed(1) > 0.5) {
				const numericPart = Math.ceil(variant * 9 + 48);
				appendValue(numericPart);
			} else {
				const alfanumericPart = Math.ceil(variant * 25 + 65);
				appendValue(alfanumericPart);
			}
		}
		return id;
	}

	function appendValue(value) {
		const str = String.fromCharCode(value);
		id = id.concat(str);
	}

	return { generateID };
}
