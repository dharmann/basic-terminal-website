class FS {
	constructor(options) {
    if (FS._instance) return FS._instance
    FS._instance = this;

		var defaultOptions = {
			"about.txt": "This website was made using only pure JavaScript with no extra libraries.\nI made it dynamic so anyone can use it, just download it from GitHub and change the config text according to your needs.\nIf you manage to find any bugs or security issues feel free to email me: luisbraganca@protonmail.com",
			"getting_started.txt": "First, go to js/main.js and replace all the text on both singleton vars.\n- configs: All the text used on the website.\n- files: All the fake files used on the website. These files are also used to be listed on the sidenav.\nAlso please notice if a file content is a raw URL, when clicked/concatenated it will be opened on a new tab.\nDon't forget also to:\n- Change the page title on the index.html file\n- Change the website color on the css/main.css\n- Change the images located at the img folder. The suggested sizes are 150x150 for the avatar and 32x32/16x16 for the favicon.",
			"contact.txt": "mail@example.com",
			"social_network_1.txt": "https://www.socialite.com/username/",
			"social_network_2.txt": "https://example.com/profile/9382/"
	};
		var options = options || defaultOptions;
		for (var key in defaultOptions) {
			this[key] = options[key] || defaultOptions[key];
		}
	}

	list() {
		return
	} // list
}
export default FS;