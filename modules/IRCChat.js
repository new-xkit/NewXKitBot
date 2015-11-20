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

var irc = require('irc');

var IRCConnections = {};

function IRCChat(host, server_port, name, pass, channel, WelcomeMsg, isSecure, cmd_prefix) {
	
	var self = this;
	var users = [];
	var userRanks = {};
	var topic = "";
	
	if (!host || !server_port || !name || !pass || !channel || !WelcomeMsg) { throw new Error("Missing argument! You need to specify host, port, name, channel and welcome message!"); }
	if (!cmd_prefix) { cmd_prefix = "!"; }
	if (typeof isSecure === "undefined") { isSecure = false; }
	if (!channel.startsWith("#")) { channel = "#" + channel; }
	
	
	if (typeof IRCConnections[host + ":" + server_port + "_" + name] === "undefined") {
		IRCConnections[host + ":" + server_port + "_" + name] = new irc.Client(host, name, {
			port: server_port,
			userName: "NewXKitBot",
			realName: "New-XKit Bot",
			secure: isSecure,
			autoRejoin: true
		}).on('registered', function(message) {
			this.say("nickserv", "identify " + pass);
			irc_con.join(channel);
		}).on("error", function(err) {
			if (err.rawCommand !== "451") {
				self.emit("error", err);
			}
		});
	} else {
		IRCConnections[host + ":" + server_port + "_" + name].join(channel);
	}
	var irc_con = IRCConnections[host + ":" + server_port + "_" + name];
	
	irc_con.on('names' + channel, function(nicks) {
		users = Object.keys(nicks);
		userRanks = nicks;
	}).on('topic', function(chan, chan_topic, nick, message) {
		if(channel === chan) {
			self.emit("topic_changed", topic, chan_topic);
			topic = chan_topic;
		}
	}).on('nick', function(old, newnick, channels, message) {
		if (name === newnick) { return; }
		self.emit("nick_changed", old, newnick, channels);
	}).on('message' + channel, function (from, message) {
		self.emit("irc_message", from, message);
		if (message.startsWith(cmd_prefix)) {
			var cmd_args = message.substring(0,1).split(" ");
			var command = cmd_args.splice(0,1)[0].toLowerCase();
			self.emit("command", command, from, cmd_args);
			self.emit("command#" + command, from, cmd_args);
		} else {
			self.emit("message", from, message);
		}
	}).on('join' + channel, function(nick, message) {
		if (name === nick) { return; }
		irc_con.send("NAMES", channel);
		irc_con.notice(nick, WelcomeMsg);
		self.emit("join", nick);
	}).on('kick' + channel, function(nick, by, reason, message) {
		if (name === nick) { return; }
		irc_con.send("NAMES", channel);
		self.emit("kick", nick, by, reason);
	}).on('part' + channel, function(nick, reason, message) {
		if (name === nick) { return; }
		irc_con.send("NAMES", channel);
		self.emit("part", nick, reason);
	}).on('quit', function(nick, reason, channels, message) {
		if (name === nick) { return; }
		irc_con.send("NAMES", channel);
		self.emit("quit", nick, reason, channels);
	}).on("kill", function(nick, reason, channels, message) {
		if (name === nick) { return; }
		irc_con.send("NAMES", channel);
		self.emit("kill", nick, reason, channels);
	});
	
	self.say = function(from, message) {
		irc_con.say(channel, "<" + from.substring(0,1) + '\u0081' + from.substring(1) + "> " + message);
	}
	self.notice = function(to, message) {
		irc_con.notice(to, message);
	}
	self.send = function(message) {
		irc_con.say(channel, message);
	}
	
	self.getUsers = function() {
		return users;
	}
	self.getUserRank = function(nick) {
		return userRanks[nick] || "";
	}
	
	self.getUsername = function() {
		return irc_con.nick;
	}
	
	self.getTopic = function() {
		return topic;
	}
	self.setTopic = function(new_topic, cb) {
		if (!cb) { cb = function() {}; }
		irc_con.send("TOPIC", channel, new_topic);
		cb();
	}
	
	self.kick = function(user, reason, cb) {
		if (!cb) { cb = function() {}; }
		irc_con.send("KICK", channel, user, reason || "You have been kicked by an admin!");
		cb();
	}
	
	self.ban = function(user, cb) {
		if (!cb) { cb = function() {}; }
		irc_con.whois(user, function(whoisinfo) {
			irc_con.send("MODE", channel, "+b", "*!*@" + whoisinfo.host);
			cb();
		});
	}
	
	self.whois = function(user, cb) {
		if (!cb) { cb = function() {}; }
		irc_con.whois(user, function(whoisinfo) {
			cb(whoisinfo);
		});
	}
	
}

require("util").inherits(IRCChat, require('events').EventEmitter);

module.exports = IRCChat;
