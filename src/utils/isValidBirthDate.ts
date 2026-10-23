export const isValidBirthDate = (birthDate: string) => {
	const [day, month, year] = birthDate.split('/').map(Number);

	if (day === undefined || month === undefined || year === undefined) {
		return false;
	}

	const date = new Date(year, month - 1, day);

	return (
		date.getFullYear() === year &&
		date.getMonth() === month - 1 &&
		date.getDate() === day
	);
};
