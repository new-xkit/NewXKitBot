/*
	A multi-functional bot for the NXKit Team
    Copyright (C) 2015 Wolvan

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/

console.log("NewXKitBot version 2, Copyright (C) 2015 Wolvan\nNewXKitBot comes with ABSOLUTELY NO WARRANTY\n\n");
console.log("Starting up NewXKitBot v2.0 by Wolvan...\n");

var GitterIRCBridge = require("./modules/GitterIRCBridge.js");

function loadConfig() {
	console.log("Loading configuration...\n");
	var extend = require("extend");
	var default_config = require("./config/default.js");
	var config = require("./config/local.js");
	for (x in config.GitterIRCBridges) {
		extend(true, config.GitterIRCBridges[x], default_config.GitterIRCBridges[x] || default_config.GitterIRCBridges[0]);
	}
	return config;
}

var config = loadConfig();


console.log("Starting Gitter-IRC Bridges...");
var girc_bridges = [];
for (x in config.GitterIRCBridges) {
	setTimeout(function(x) {
		console.log("Starting bridge " + x + ": " + config.GitterIRCBridges[x].gitter.channel + " <-> " + config.GitterIRCBridges[x].irc.channel); 
		girc_bridges[x] = new GitterIRCBridge(config.GitterIRCBridges[x]);
	}.bind(this, x), x * 1000);
}
