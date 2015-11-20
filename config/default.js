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

module.exports = {
	GitterIRCBridges: [
		{
			gitter: {
				token: process.env.NXB_GITTER_TOKEN,
				channel: process.env.NXB_GITTER_CHANNEL
			},
			irc: {
				host: "chat.freenode.net",
				port: 7000,
				nick: process.env.NXB_IRC_NICK,
				password: "None",
				channel: process.env.NXB_IRC_CHANNEL,
				welcome_message:
					"Welcome to the Live Support for New XKit. If you did not yet set a username, please use /nick <Username> to do so." +
					"\nJust go ahead and ask whatever questions you have! If we do not respond immediately, please be patient. We might be away/busy/asleep. " +
					"Once we have time, we'll get back to you.",
				ssl: true
			},
			github: {
				org: process.env.NXB_GITHUB_ORG,
				repo: process.env.NXB_GITHUB_REPO,
				auth: process.env.NXB_GITHUB_TOKEN
			},
			cmd_prefix: "!",
			commands_gitter: {
				list: {
					not_elevated: true,
					run: function(user, args, gitter, irc) {
						var users = irc.getUsers();
						var msg = "";
						if (users.length <= 1) {
							msg = "[GitterBridge] There are no users online.";
						} else {
							users.map(function(value, index, array) {
								if (value === irc.getUsername()) {
									users.splice(index, 1);
								}
							});
							msg = "[GitterBridge] There are " + users.length + " User(s) online: " + users.join(", ");
						}
						gitter.say(msg);
					}
				},
				whois: {
					not_elevated: true,
					run: function(user, args, gitter, irc) {
						irc.whois(args[0], function(username, whoisinfo) {
							gitter.say("[GitterBridge] Whois for " + username + ":\n```\n" + JSON.stringify(whoisinfo, null, "\t") + "\n```");
						}.bind(this, user));
					}
				},
				xcloud: {
					not_elevated: true,
					run: function(user, args, gitter, irc) {
						var msg = "XCloud Migration Guide: http://portal.new-xkit.com/assets/migration/xcloud-migration.html";
						if (!args[0]) {
							irc.send(msg);
						} else {
							irc.notice(args[0], msg);
						}
						gitter.say("[GitterBridge] Migration guide linked.");
					}
				},
				chrome: {
					not_elevated: true,
					run: function(user, args, gitter, irc) {
						var msg = "New XKit Download for Google Chrome: http://new-xkit-extension.tumblr.com/chrome";
						if (!args[0]) {
							irc.send(msg);
						} else {
							irc.notice(args[0], msg);
						}
						gitter.say("[GitterBridge] Chrome download linked.");
					}
				},
				firefox: {
					not_elevated: true,
					run: function(user, args, gitter, irc) {
						var msg = "New XKit Download for Mozilla Firefox: http://new-xkit-extension.tumblr.com/firefox";
						if (!args[0]) {
							irc.send(msg);
						} else {
							irc.notice(args[0], msg);
						}
						gitter.say("[GitterBridge] Firefox download linked.");
					}
				},
				edump: {
					not_elevated: true,
					run: function(user, args, gitter, irc) {
						var msg = "How to create an extension dump:\n" +
						"1.) Go to your XKit Control Panel\n" +
						"2.) Go to the 'Other' tab\n" +
						"3.) Click on 'Export Configuration'\n" +
						"4.) Depending on what we ask for, click either 'Extension Info Export' (this is what we need most of the time) or 'Full Configuration Export'\n" +
						"5.) Copy the https://gist.github.com/ link it generates and give it to us\n";
						if (!args[0]) {
							irc.send(msg);
						} else {
							irc.notice(args[0], msg);
						}
						gitter.say("[GitterBridge] Extension dump guide sent.");
					}
				},
				help: {
					not_elevated: true,
					run: function(user, args, gitter, irc) {
						gitter.say(
							"#Commands\n" +
							"**!list** - List all online users\n" +
							"**!kick** <nick> [reason] - Kicks the user from the channel\n" +
							"**!ban** <nick> - Ban the Hostname of the user\n" +
							"**!whois** <nick> - Retrieve whois information\n" +
							"**!topic** [topic] - Get or set the IRC Channel topic\n" +
							"**!xcloud** [nick] - Link the XCloud migration guide [to a user]\n" +
							"**!chrome** [nick] - Link the Chrome download link [to a user]\n" +
							"**!firefox** [nick] - Link the Firefox download link [to a user]\n" +
							"**!edump** [nick] - Print a step by step guide to dump extensions [to a user]\n" +
							"**!help** - Print this help message\n" +
							"\nCredits:\nGitterBridge v2.0 written by **Wolvan**"
						);
					}
				},
				
				kick: {
					run: function(user, args, gitter, irc) {
						if (args.length < 1) {
							gitter.say("[GitterBridge] Usage: `!kick <nick> [reason]`")
						} else {
							irc.kick(args.splice(0,1)[0], args.join(" "));
						}
					},
					not_allowed: function(user, gitter, irc) {
						gitter.say("[GitterBridge] You do not have access to the `kick` command, " + user);
					}
				},
				ban: {
					run: function(user, args, gitter, irc) {
						if (args.length < 1) {
							gitter.say("[GitterBridge] Usage: `!ban <nick>`")
						} else {
							irc.ban(args.splice(0,1)[0], args.join(" "), function(username, gitter) {
								gitter.say("**" + username + " has been banned**");
							}.bind(this, user, gitter));
						}
					},
					not_allowed: function(user, gitter, irc) {
						gitter.say("[GitterBridge] You do not have access to the `ban` command, " + user);
					}
				},
				topic: {
					run: function(user, args, gitter, irc) {
						if (args.length < 1) {
							gitter.say("[GitterBridge] Current topic: " + irc.getTopic());
						} else {
							irc.setTopic(args.join(" "), function(new_topic, gitter) {
								gitter.say("[GitterBridge] Channel Topic changed to '" + new_topic + "'");
							}.bind(this, args.join(" "), gitter));
						}
					},
					not_allowed: function(user, gitter, irc) {
						gitter.say("[GitterBridge] You do not have access to the `topic` command, " + user);
					}
				}
			},
			commands_irc: {}
		}
	]
}
