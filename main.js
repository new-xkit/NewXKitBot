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
