const mongoose = require('mongoose');

const User = mongoose.Schema(
	{
		email: String,
		username: String,
		password: String,
		region: String,
		memberOfChannels: [ { _id: false, channelId: String } ]
	},
	{ timestamps: true }
);

const Channel = mongoose.Schema(
	{
		name: String,
		description: String,
		createdBy: String,
		members: [ { _id: false, username: String } ],
		posts: [ { _id: false, message: String, username: String, timestamp: String } ]
	},
	{ timestamps: true }
);

const Invite = mongoose.Schema(
	{
		username: String,
		channelId: String,
		channelName: String,
		sentBy: String
	},
	{ timestamps: true }
);

module.exports.Channel = mongoose.model('Channel', Channel);
module.exports.Invite = mongoose.model('Invite', Invite);
module.exports.User = mongoose.model('User', User);
