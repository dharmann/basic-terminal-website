
import Utils from './Utils.js';

class TypeSimulator {
	constructor(timer, output) {
		var timer = parseInt(timer);
		if (timer === Number.NaN || timer < 0) {
			throw new InvalidArgumentException("Invalid value " + timer + " for argument 'timer'.");
		}
		if (!(output instanceof Node)) {
			throw new InvalidArgumentException("Invalid value " + output + " for argument 'output'.");
		}
		this.timer = timer;
		this.output = output;
	}
	type(text, callback) {
		text = text || '';
		if (Utils.isURL(text)) {
			window.open(text);
		}
		var i = 0;
		var output = this.output;
		var timer = this.timer;
		var skipped = true;
		var skip = function () {
			skipped = true;
		}.bind(this);
		document.addEventListener("dblclick", skip);
		(function typer() {
			if (i < text.length) {
				var char = text.charAt(i);
				var isNewLine = char === "\n";
				output.innerHTML += isNewLine ? "<br/>" : char;
				i++;
				if (!skipped) {
					setTimeout(typer, isNewLine ? timer * 2 : timer);
				} else {
					output.innerHTML += (text.substring(i).replace(new RegExp("\n", 'g'), "<br/>")) + "<br/>";
					document.removeEventListener("dblclick", skip);
					callback();
				}
			} else if (callback) {
				output.innerHTML += "<br/>";
				document.removeEventListener("dblclick", skip);
				callback();
			}
			Utils.scrollToBottom();
		})();
	}
}
export default TypeSimulator;