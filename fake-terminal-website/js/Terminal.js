import InvalidArgumentException from './InvalidArgumentException.js';
import TypeSimulator from './TypeSimulator.js';
import Config from './Config.js';
import Utils from './Utils.js';
import FS from './FS.js';

class Terminal {
	constructor(prompt, cmdLine, output, sidenav, profilePic, user, host, root, outputTimer) {
		if (!(prompt instanceof Node) || prompt.nodeName.toUpperCase() !== "DIV") {
			throw new InvalidArgumentException("Invalid value " + prompt + " for argument 'prompt'.");
		}
		if (!(cmdLine instanceof Node) || cmdLine.nodeName.toUpperCase() !== "INPUT") {
			throw new InvalidArgumentException("Invalid value " + cmdLine + " for argument 'cmdLine'.");
		}
		if (!(output instanceof Node) || output.nodeName.toUpperCase() !== "DIV") {
			throw new InvalidArgumentException("Invalid value " + output + " for argument 'output'.");
		}
		if (!(sidenav instanceof Node) || sidenav.nodeName.toUpperCase() !== "DIV") {
			throw new InvalidArgumentException("Invalid value " + sidenav + " for argument 'sidenav'.");
		}
		if (!(profilePic instanceof Node) || profilePic.nodeName.toUpperCase() !== "IMG") {
			throw new InvalidArgumentException("Invalid value " + profilePic + " for argument 'profilePic'.");
		}
		(typeof user === "string" && typeof host === "string") && (this.completePrompt = user + "@" + host + ":~" + (root ? "#" : "$"));
		this.profilePic = profilePic;
		this.prompt = prompt;
		this.cmdLine = cmdLine;
		this.output = output;
		this.sidenav = sidenav;
		this.sidenavOpen = false;
		this.sidenavElements = [];
		this.typeSimulator = new TypeSimulator(outputTimer, output);
		this.config = new Config();
		this.files = new FS();
	} // constructor

	type(text, callback) {
		this.typeSimulator.type(text, callback);
	} // type

	exec() {
		var command = this.cmdLine.value;
		this.cmdLine.value = "";
		this.prompt.textContent = "";
		this.output.innerHTML += "<span class=\"prompt-color\">" + this.completePrompt + "</span> " + command + "<br/>";
	} // exec

	init() {
		this.sidenav.addEventListener("click", Utils.ignoreEvent);
		this.cmdLine.disabled = true;
		this.sidenavElements.forEach(function (elem) {
				elem.disabled = true;
		});
		this.prepareSideNav();
		this.lock(); // Need to lock here since the sidenav elements were just added
		document.body.addEventListener("click", function (event) {
				if (this.sidenavOpen) {
						this.handleSidenav(event);
				}
				this.focus();
		}.bind(this));
		this.cmdLine.addEventListener("keydown", function (event) {
				if (event.which === 13 || event.keyCode === 13) {
						this.handleCmd();
						Utils.ignoreEvent(event);
				} else if (event.which === 9 || event.keyCode === 9) {
						this.handleFill();
						Utils.ignoreEvent(event);
				}
		}.bind(this));
		this.reset();
	} // init

	makeElementDisappear(element) {
		element.style.opacity = 0;
		element.style.transform = "translateX(-300px)";
	} // makeElementDisappear

	makeElementAppear(element) {
		element.style.opacity = 1;
		element.style.transform = "translateX(0)";
	} // makeElementAppear

	prepareSideNav() {
		var capFirst = (function () {
				return function (string) {
						return string.charAt(0).toUpperCase() + string.slice(1);
				}
		})();

		for (var file in this.files) {
				var element = document.createElement("button");
				this.makeElementDisappear(element);
				element.onclick = function (file, event) {
						this.handleSidenav(event);
						this.cmdLine.value = "cat " + file + " ";
						this.handleCmd();
				}.bind(this, file);
				element.appendChild(document.createTextNode(capFirst(file.replace(/\.[^/.]+$/, "").replace(/_/g, " "))));
				this.sidenav.appendChild(element);
				this.sidenavElements.push(element);
		}
		// Shouldn't use document.getElementById but Terminal is already using loads of params
		document.getElementById("sidenavBtn").addEventListener("click", this.handleSidenav.bind(this));
	} // prepareSideNav

	handleSidenav(event) {
		if (this.sidenavOpen) {
				this.profilePic.style.opacity = 0;
				this.sidenavElements.forEach(this.makeElementDisappear);
				this.sidenav.style.width = "35px";
				document.getElementById("sidenavBtn").innerHTML = "&#9776;";
				this.sidenav.style.backgroundColor='black';
				document.getElementById("container").style.filter='blur(0)';
				this.sidenavOpen = false;
		} else {
				this.sidenav.style.width = "300px";
				this.sidenavElements.forEach(this.makeElementAppear);
				document.getElementById("sidenavBtn").innerHTML = "&times;";
				this.profilePic.style.opacity = 1;

				this.sidenav.style.backgroundColor='#f7d07e';
				document.getElementById("container").style.filter='blur(5px)';
				this.sidenavOpen = true;
		}
		document.getElementById("sidenavBtn").blur();
		Utils.ignoreEvent(event);
	} // handleSidenav

	lock() {
		this.exec();
		this.cmdLine.blur();
		this.cmdLine.disabled = true;
		this.sidenavElements.forEach(function (elem) {
				elem.disabled = true;
		});
	} // lock

	unlock() {
		this.cmdLine.disabled = false;
		this.prompt.textContent = this.completePrompt;
		this.sidenavElements.forEach(function (elem) {
				elem.disabled = false;
		});
		Utils.scrollToBottom();
		this.focus();
	} // unlock

	handleFill() {
		var cmdComponents = this.cmdLine.value.trim().split(" ");
		if ((cmdComponents.length <= 1) || (cmdComponents.length === 2 && cmdComponents[0] === this.config.cmds.CAT.value)) {
				this.lock();
				var possibilities = [];
				if (cmdComponents[0].toLowerCase() === this.config.cmds.CAT.value) {
						if (cmdComponents.length === 1) {
								cmdComponents[1] = "";
						}
						if (this.config.welcome_file_name.startsWith(cmdComponents[1].toLowerCase())) {
								possibilities.push(this.config.cmds.CAT.value + " " + this.config.welcome_file_name);
						}
						for (var file in this.files) {
								if (file.startsWith(cmdComponents[1].toLowerCase())) {
										possibilities.push(this.config.cmds.CAT.value + " " + file);
								}
						}
				} else {
						for (var command in this.config.cmds) {
								if (this.config.cmds[command].value.startsWith(cmdComponents[0].toLowerCase())) {
										possibilities.push(this.config.cmds[command].value);
								}
						}
				}
				if (possibilities.length === 1) {
						this.cmdLine.value = possibilities[0] + " ";
						this.unlock();
				} else if (possibilities.length > 1) {
						this.type(possibilities.join("\n"), function () {
								this.cmdLine.value = cmdComponents.join(" ");
								this.unlock();
						}.bind(this));
				} else {
						this.cmdLine.value = cmdComponents.join(" ");
						this.unlock();
				}
		}
	} // handleFill

	handleCmd() {
		var cmdComponents = this.cmdLine.value.trim().split(" ");
		this.lock();
		switch (cmdComponents[0]) {
				case this.config.cmds.CAT.value:
						this.cat(cmdComponents);
						break;
				case this.config.cmds.LS.value:
						this.ls();
						break;
				case this.config.cmds.WHOAMI.value:
						this.whoami();
						break;
				case this.config.cmds.DATE.value:
						this.date();
						break;
				case this.config.cmds.HELP.value:
						this.help();
						break;
				case this.config.cmds.CLEAR.value:
						this.clear();
						break;
				case this.config.cmds.REBOOT.value:
						this.reboot();
						break;
				case this.config.cmds.CD.value:
				case this.config.cmds.MV.value:
				case this.config.cmds.RMDIR.value:
				case this.config.cmds.RM.value:
				case this.config.cmds.TOUCH.value:
						this.permissionDenied(cmdComponents);
						break;
				case this.config.cmds.SUDO.value:
						this.sudo();
						break;
				default:
						this.invalidCommand(cmdComponents);
						break;
		};
	} // handleCmd

	cat(cmdComponents) {
		var result;
		if (cmdComponents.length <= 1) {
				result = this.config.usage + ": " + this.config.cmds.CAT.value + " <" + this.config.file + ">";
		} else if (!cmdComponents[1] || (!cmdComponents[1] === this.config.welcome_file_name || !this.files.hasOwnProperty(cmdComponents[1]))) {
			if(cmdComponents[1] === this.config.welcome_file_name)
				result = cmdComponents[1] === this.config.welcome_file_name ? this.config.welcome : this.files[cmdComponents[1]];
			else
				result = this.config.file_not_found.replace(this.config.value_token, cmdComponents[1]);
		} else {
				result = cmdComponents[1] === this.config.welcome_file_name ? this.config.welcome : this.files[cmdComponents[1]];
		}
		this.type(result, this.unlock.bind(this));
	} // cat

	ls() {
		var result = ".\n..\n" + this.config.welcome_file_name + "\n";
		for (var file in this.files) {
				result += file + "\n";
		}
		this.type(result.trim(), this.unlock.bind(this));
	} // ls

	sudo() {
		this.type(this.config.sudo_message, this.unlock.bind(this));
	} // sudo

	whoami(cmdComponents) {
		var result = this.config.username + ": " + this.config.user + "\n" + this.config.hostname + ": " + this.config.host + "\n" + this.config.platform + ": " + navigator.platform + "\n" + this.config.accesible_cores + ": " + navigator.hardwareConcurrency + "\n" + this.config.language + ": " + navigator.language;
		this.type(result, this.unlock.bind(this));
	} // whoami

	date(cmdComponents) {
		this.type(new Date().toString(), this.unlock.bind(this));
	} // date

	help() {
		var result = this.config.general_help + "\n\n";
		for (var cmd in this.config.cmds) {
				result += this.config.cmds[cmd].value + " - " + this.config.cmds[cmd].help + "\n";
		}
		this.type(result.trim(), this.unlock.bind(this));
	} // help

	clear() {
		this.output.textContent = "";
		this.prompt.textContent = "";
		this.prompt.textContent = this.completePrompt;
		this.unlock();
	} // clear

	reboot() {
		this.type(this.config.reboot_message, this.reset.bind(this));
	} // reboot

	reset() {
		this.output.textContent = "";
		this.prompt.textContent = "";
		if (this.typeSimulator) {
				this.type(this.config.welcome, function () {
						this.unlock();
				}.bind(this));
				this.clear();
		}
	} // reset

	permissionDenied(cmdComponents) {
		this.type(this.config.permission_denied_message.replace(this.config.value_token, cmdComponents[0]), this.unlock.bind(this));
	} // permissionDenied

	invalidCommand(cmdComponents) {
		this.type(this.config.invalid_command_message.replace(this.config.value_token, cmdComponents[0]), this.unlock.bind(this));
	} // invalidCommand

	focus() {
		this.cmdLine.focus();
	} // focus
}

export default Terminal;