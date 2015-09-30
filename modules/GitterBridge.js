var irc = require('irc');

module.exports = function(Config) {	
	this.gitter = new irc.Client('irc.gitter.im', Config.Gitter_Username, {
		channels: [Config.Gitter_Channel],
		secure: true,
		password: Config.Gitter_Password,
		autoRejoin: true,
	});
	this.freenode = new irc.Client("chat.freenode.net", Config.IRC_Username, {
		channels: [Config.IRC_Channel],
		autoRejoin: true,
	});
	
	this.freenode.users = [];
	this.freenode.topic = "";

	this.gitter.addListener('message' + Config.Gitter_Channel, function (from, message) {
		if (!message.startsWith(Config.Gitter_Command_Prefix)) {
			freenode.say(Config.IRC_Channel, "<" + from + "> " + message.replace(/new-xkit\/XKit#/ig, "https://github.com/new-xkit/XKit/issues/"));
		}
	});
	this.freenode.addListener('message' + Config.IRC_Channel, function (from, message) {
		gitter.say(Config.Gitter_Channel, "<" + from.substring(0,1) + '\u0081' + from.substring(1) + "> " + message);
	});

	this.freenode.addListener('registered', function(message) {
		freenode.say("nickserv", "identify " + Config.IRC_Password);
	})

	this.gitter.addListener('error', function(message) {
		console.log('Gitter Error: ', message);
	});
	this.freenode.addListener('error', function(message) {
		console.log('Freenode Error: ', message);
	});
	
	this.freenode.addListener('join' + Config.IRC_Channel, function(nick, message) {
		freenode.send("NAMES", Config.IRC_Channel);
		if (freenode.nick === nick) { return; }
		gitter.say(Config.Gitter_Channel, "<" + nick + "> has joined.");
		freenode.say(nick, Config.IRC_WelcomeMsg);
	});
	this.freenode.addListener('kick' + Config.IRC_Channel, function(nick, by, reason, message) {
		if (freenode.nick === nick) { return; }
		gitter.say(Config.Gitter_Channel, "<" + nick + "> has been kicked by " + by + " for '" + reason + "'.");
		freenode.send("NAMES", Config.IRC_Channel);
	});
	this.freenode.addListener('part' + Config.IRC_Channel, function(nick, reason, message) {
		if (freenode.nick === nick) { return; }
		gitter.say(Config.Gitter_Channel, "<" + nick + "> has left.");
		freenode.send("NAMES", Config.IRC_Channel);
	});
	this.freenode.addListener('quit', function(nick, reason, channels, message) {
		if (freenode.nick === nick) { return; }
		gitter.say(Config.Gitter_Channel, "<" + nick + "> has left.");
		freenode.send("NAMES", Config.IRC_Channel);
	});
	
	this.freenode.addListener('nick', function(old, newnick, channels, message) {
		if (freenode.nick === newnick) { return; }
		gitter.say(Config.Gitter_Channel, "<" + old + "> is now known as <" + newnick + ">.");
	});
	
	this.freenode.addListener('names' + Config.IRC_Channel, function(nicks) {
		freenode.users = Object.keys(nicks);
	});
	this.freenode.addListener('topic', function(channel, topic, nick, message) {
		if(channel !== Config.IRC_Channel) {
			return;
		}
		freenode.topic = topic;
	})

	return this;
};
