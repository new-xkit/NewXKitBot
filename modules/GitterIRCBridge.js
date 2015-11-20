var GitterChat = require("./GitterChat");
var IRCChat = require("./IRCChat");
var octonode = require("octonode");

function transform_message(msg, github_org, github_repo) {
	// In gitter we can do org_or_username/repo#IssueNr., the following replace turns all these into proper links for the irc
	msg = msg.replace(new RegExp(github_org + "/" + github_repo + "#", "gi"), "https://github.com/" + github_org + "/" + github_repo + "/issues/");
	
	// This regex checks if the last message was an image by parsing the markdown in the following format
	// [![FILENAME](IMAGE_URL)](IMAGE_URL)
	if (msg.match(/\[!\[(.*?)]/gi)) { // First we check if [![*] exists, which indicates an image being shared
		var img_name = msg.match(/\[!\[(.*?)]/gi)[0]; // We grab the filename here
		img_name = img_name.substring(3, img_name.length - 1); // and then we remove the [![ in the beginning and the ] in the end to get our filename
		var img_url = msg.match(/]\((.*?)\)]/gi)[0]; // Same thing happening here, we get the image url by grabbing everything between ]( and )]
		img_url = img_url.substring(2, img_url.length - 2); // and remove the ]( and )]
		msg = "shared '" + img_name + "': " + img_url; // using that information we put together the message
	}
	return msg;
}

function Bridge(bridge_config) {
	var self = this;
	
	if (!bridge_config || typeof bridge_config !== "object") { throw new Error("A bridge config must be specified in form of an object"); }
	
	var github = octonode.client(bridge_config.github.auth);
	
	var gitter = new GitterChat(
		bridge_config.gitter.token,
		bridge_config.gitter.channel,
		bridge_config.cmd_prefix
	);
	var irc = new IRCChat(
		bridge_config.irc.host,
		bridge_config.irc.port,
		bridge_config.irc.nick,
		bridge_config.irc.password,
		bridge_config.irc.channel,
		bridge_config.irc.welcome_message,
		bridge_config.irc.ssl || false,
		bridge_config.cmd_prefix
	);
	
	gitter.on("message", function(from, msg) {
		msg = transform_message(msg);
		irc.say(from, msg);
	}).on("message_update", function(from, msg) {
		msg = transform_message(msg);
		irc.say(from, "[EDIT] " + msg);
	});
	irc.on("message", function(from, msg) {
		gitter.say("`" + from + "` " + msg);
	});
	
	irc.on("nick_changed", function(old_nick, new_nick) {
		gitter.say("*" + old_nick + "* is now known as *" + new_nick + "*.")
	}).on("join", function(nick) {
		gitter.say("*" + nick + " has joined.*");
	}).on("kick", function(nick, by, reason) {
		gitter.say("*" + nick + " has been kicked by " + by + " for '" + reason + "'.*");
	}).on("part", function(nick, reason) {
		gitter.say("*" + nick + " has left.*");
	}).on("quit", function(nick, reason, channels) {
		gitter.say("*" + nick + " has quit.*");
	}).on("kill", function(nick, reason, channels) {
		gitter.say("*" + nick + " was killed by the IRC network for '" + reason + "'.*");
	});
	
	irc.on("error", function(err) {
		console.log(err);
	});
	gitter.on("error", function(err) {
		console.log(err);
	});
	
	for (var x in bridge_config.commands_gitter) {
		gitter.on("command#" + x, function(command_data, from, args) {
			if (command_data.not_elevated) {
				command_data.run(from, args, gitter, irc);
			} else {
				github.org(bridge_config.github.org).member(from, function(user, args, command, error, isOrgMember, headers) {
					if(isOrgMember) {
						command.run(user, args, gitter, irc);
					} else {
						command.not_allowed(user, gitter, irc);
					}
				}.bind(this, from, args, command_data));
			}
		}.bind(this, bridge_config.commands_gitter[x]));
	}
	for (var y in bridge_config.commands_irc) {
		irc.on("command#" + y, function(command_data, from, args) {
			if (command_data.not_elevated) {
				command_data.run(from, args, irc, gitter);
			} else {
				if(irc.getUserRank(from) === "@") {
					command_data.run(from, args, irc, gitter);
				} else {
					command_data.not_allowed(from, irc, gitter);
				}
			}
		}.bind(this, bridge_config.commands_irc[y]));
	}
}

module.exports = Bridge;
