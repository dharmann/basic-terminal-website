"use strict";

import Config from './Config.js';
import Terminal from './Terminal.js';

var config = new Config();
var main = (function () {
    return {
        listener: function () {
            new Terminal(
                document.getElementById("prompt"),
                document.getElementById("cmdline"),
                document.getElementById("output"),
                document.getElementById("sidenav"),
                document.getElementById("profilePic"),
                config.user,
                config.host,
                config.is_root,
                config.type_delay
            ).init();
        }
    };
})();

window.onload = main.listener;