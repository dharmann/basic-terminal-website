class InvalidArgumentException {
	constructor(message) {
		this.message = message;
		// Use V8's native method if available, otherwise fallback
		if ("captureStackTrace" in Error) {
			Error.captureStackTrace(this, InvalidArgumentException);
		} else {
			this.stack = (new Error()).stack;
		}
	}
}
export default InvalidArgumentException;
			// Extends Error
			// InvalidArgumentException.prototype = Object.create(Error.prototype);
			// InvalidArgumentException.prototype.name = "InvalidArgumentException";