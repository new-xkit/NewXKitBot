// Load compatibility layer for older Node versions
require("./modules/Compatibility.js");

// Load Config
var Config = require("./newxkitbot.conf.js");

// Initiate GitHub API client
var github_client = require("octonode").client({
	username: Config.Octonode.username,
	password: Config.Octonode.password
});

// Start GitterBridge
if (Config.GitterBridge.ENABLED) {
	GitterBridge = new require("./modules/GitterBridge.js")(Config.GitterBridge);
	GitterBridge.gitter.addListener('message' + Config.GitterBridge.Gitter_Channel, function (from, message) {
		if (message.startsWith(Config.GitterBridge.Gitter_Command_Prefix)) {
			var cmd = message.substring(1);
			github_client.org("new-xkit").member(from, function(user, command, error, isOrgMember, headers) {
				var cmdSplit = command.split(" ");
				switch(cmdSplit.splice(0,1)[0].toLowerCase()) {
					case "list":
						var users = GitterBridge.freenode.users;
						var msg = "";
						if (users.length <= 1) {
							msg = "[GitterBridge] There are no Users online.";
						} else {
							for(var i = 0; i < users.length; i++) {
								if (users[i] === GitterBridge.freenode.nick) {
									users.splice(i, 1);
									break;
								}
							}
							msg = "[GitterBridge] There are " + users.length + " User(s) online: " + users.join(", ");
						}
						GitterBridge.gitter.say(Config.GitterBridge.Gitter_Channel, msg);
						break;
					case "kick":
						if(isOrgMember) {
							if (cmdSplit.length < 1) {
								GitterBridge.gitter.say(Config.GitterBridge.Gitter_Channel, "[GitterBridge] Usage: `" + Config.GitterBridge.Gitter_Command_Prefix + "kick <nick> [reason]`");
								return;
							}
							GitterBridge.freenode.send("KICK", Config.GitterBridge.IRC_Channel, cmdSplit.splice(0,1)[0], cmdSplit.join(" "));
						} else {
							GitterBridge.gitter.say(Config.GitterBridge.Gitter_Channel, "[GitterBridge] You do not have access to the `kick` command, " + user);
						}
						break;
					case "ban":
						if(isOrgMember) {
							if (cmdSplit.length < 1) {
								GitterBridge.gitter.say(Config.GitterBridge.Gitter_Channel, "[GitterBridge] Usage: `" + Config.GitterBridge.Gitter_Command_Prefix + "ban <nick>`");
								return;
							}
							GitterBridge.freenode.whois(cmdSplit[0], function(username, whoisinfo) {
								GitterBridge.freenode.send("MODE", Config.GitterBridge.IRC_Channel, "+b", "*!*@" + whoisinfo.host);
								GitterBridge.gitter.say(Config.GitterBridge.Gitter_Channel, "<" + username + "> has been banned.");
							}.bind(this, cmdSplit[0]));
						} else {
							GitterBridge.gitter.say(Config.GitterBridge.Gitter_Channel, "[GitterBridge] You do not have access to the `ban` command, " + user);
						}
						break;
					case "whois":
						if (cmdSplit.length < 1) {
							GitterBridge.gitter.say(Config.GitterBridge.Gitter_Channel, "[GitterBridge] Usage: `" + Config.GitterBridge.Gitter_Command_Prefix + "whois <nick>`");
							return;
						}
						GitterBridge.freenode.whois(cmdSplit[0], function(username, whoisinfo) {
							GitterBridge.gitter.say(Config.GitterBridge.Gitter_Channel, "[GitterBridge] Whois for " + username + ":\n" + JSON.stringify(whoisinfo, null, "\t"));
						}.bind(this, cmdSplit[0]));
						break;
					case "topic":
						if (cmdSplit.length < 1) {
							GitterBridge.gitter.say(Config.GitterBridge.Gitter_Channel, "[GitterBridge] Current topic: " + GitterBridge.freenode.topic);
							return;
						}
						if (isOrgMember) {
							GitterBridge.freenode.send("TOPIC", Config.GitterBridge.IRC_Channel, cmdSplit.join(" "));
							GitterBridge.gitter.say(Config.GitterBridge.Gitter_Channel, "[GitterBridge] Channel Topic changed to '" + cmdSplit.join(" ") + "'");
						} else {
							GitterBridge.gitter.say(Config.GitterBridge.Gitter_Channel, "[GitterBridge] You do not have access to the `topic <topic>` command, " + user);
						}
						break;
					case "xcloud":
						if (cmdSplit.length < 1) {
							GitterBridge.freenode.say(Config.GitterBridge.IRC_Channel, "XCloud Migration Guide: http://portal.new-xkit.com/assets/migration/xcloud-migration.html");
						} else {
							GitterBridge.freenode.say(Config.GitterBridge.IRC_Channel, cmdSplit[0] + ": XCloud Migration Guide: http://portal.new-xkit.com/assets/migration/xcloud-migration.html");
						}
						GitterBridge.gitter.say(Config.GitterBridge.Gitter_Channel, "[GitterBridge] Migration guide linked.");
						break;
					case "edump":
						var msg = "How to create an extension dump:\n" +
						"1.) Go to your XKit Control Panel\n" +
						"2.) Go to the 'Other' tab\n" +
						"3.) Click on 'Export Configuration'\n" +
						"4.) Depending on what we ask for, click either 'Extension Info Export' (if we don't say anything specifically, do this) or 'Full Configuration Export'\n" +
						"5.) Copy the https://gist.github.com/ link it generates and give it to us\n";
						if (cmdSplit.length >= 1) {
							msg = cmdSplit[0] + ": " + msg;
						}
						GitterBridge.freenode.say(Config.GitterBridge.IRC_Channel, msg);
						GitterBridge.gitter.say(Config.GitterBridge.Gitter_Channel, "[GitterBridge] Extension dump guide sent.");
						break;
					case "help":
						GitterBridge.gitter.say(Config.GitterBridge.Gitter_Channel,
						"#Commands\n**" +
						Config.GitterBridge.Gitter_Command_Prefix + "list**\n**" +
						Config.GitterBridge.Gitter_Command_Prefix + "kick** <nick> [reason] - Kicks the user from the channel\n**" +
						Config.GitterBridge.Gitter_Command_Prefix + "ban** <nick> - Ban the Hostname of the user\n**" +
						Config.GitterBridge.Gitter_Command_Prefix + "whois** <nick> - Retrieve whois information\n**" +
						Config.GitterBridge.Gitter_Command_Prefix + "topic** [topic] - Get or set the IRC Channel topic\n**" +
						Config.GitterBridge.Gitter_Command_Prefix + "xcloud** [nick] - Link the XCloud migration guide [to a user]\n**" +
						Config.GitterBridge.Gitter_Command_Prefix + "edump** [nick] - Print a step by step guide to dump extensions [to a user]\n**" +
						Config.GitterBridge.Gitter_Command_Prefix + "help** - Print this help message\n" +
						"Credits:\nGitterBridge v1.0 written by **Wolvan**"
						);
						break;
				}
			}.bind(this, from, cmd));
		}
	});
}