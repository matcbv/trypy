export const dateFormatter = (value) => {
	let raw = value.replace(/\D/g, '');
	raw = raw.length > 8 ? raw.slice(0, 8) : raw;

	if (raw.length > 4) {
		raw = `${raw.slice(0, 2)}/${raw.slice(2, 4)}/${raw.slice(4)}`;
	} else if (raw.length > 2) {
		raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
	}
	return raw;
};
