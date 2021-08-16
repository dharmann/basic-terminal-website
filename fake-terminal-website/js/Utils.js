class Utils {
	static ignoreEvent(event) {
		event.preventDefault();
		event.stopPropagation();
	} // ignoreEvent

	static scrollToBottom() {
		window.scrollTo(0, document.body.scrollHeight);
	} // scrollToBottom

	static isURL(str) {
		str = str || '';
		return (str.startsWith("http") || str.startsWith("www")) && str.indexOf(" ") === -1 && str.indexOf("\n") === -1;
	} // isURL
}

export default Utils;