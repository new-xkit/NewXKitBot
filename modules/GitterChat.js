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

var Gitter = require('node-gitter');

function GitterChat(gitter_token, channel, cmd_prefix) {
	
	if (!gitter_token || !channel) { throw new Error("Gitter Token or Room not specified!") }
	if (!cmd_prefix) { cmd_prefix = "!"; }
	
	var self = this;
	var username = "";
	
	self.client = new Gitter(gitter_token);
	
	self.client.currentUser().then(function(user) {
		username = user.username;
	});
	
	self.client.rooms.join(channel)
	.then(function (room) {
		var events = room.streaming().chatMessages();
		events.on("chatMessages", function(message) {
			self.emit("chatMessages", message);
			if (message.operation === "patch") { return; }
			if (message.model.fromUser.username === username) { return; }
			if (message.model.text.startsWith(cmd_prefix)) {
				var cmd_string = message.model.text.substring(1);
				var cmd_array = cmd_string.split(" ");
				var command = cmd_array.splice(0,1)[0].toLowerCase();
				
				self.emit("command", command, message.model.fromUser.username, cmd_array, message);
				self.emit("command#" + command, message.model.fromUser.username, cmd_array, message);
			} else {
				var event_name;
				if (message.operation === "create") {
				  event_name = "message"
				} else if (message.operation === "update") {
				  event_name = "message_update"
				}
				self.emit(event_name, message.model.fromUser.username, message.model.text, message);
			}
		});
	}).fail(function(error) {
		self.emit("error", error);
	});
	
	self.say = function(message) {
		self.client.rooms.join(channel)
		.then(function(room) {
			room.send(message);
		}).fail(function(err) {
			self.emit("error", err);
		});
	}
	
	self.getUsername = function() {
		return username;
	}
}

require("util").inherits(GitterChat, require('events').EventEmitter);

module.exports = GitterChat;
