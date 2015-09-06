// Load Config
Config = require("./newxkitbot.conf.js");

// Start GitterBridge
GitterBridge = new require("./modules/GitterBridge.js")(Config.GitterBridge);
