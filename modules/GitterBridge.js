var irc = require('irc');

module.exports = function(Config) {
	if (Config.ENABLED) {
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

		this.gitter.addListener('message' + Config.Gitter_Channel, function (from, message) {
			freenode.say(Config.Gitter_Channel, "<" + from + "> " + message);
		});

		this.freenode.addListener('message' + Config.IRC_Channel, function (from, message) {
			gitter.say(Config.IRC_Channel, "`" + from + "` " + message);
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
	}
	
	return this;
}
