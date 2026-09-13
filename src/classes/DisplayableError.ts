export class DisplayableError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'DisplayableError';
	}
}
