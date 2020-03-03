const mongoose = require('mongoose');

const User = mongoose.Schema(
	{
		email: String,
		username: String,
		password: String,
		region: String,
		memberOfChannels: [ { channelId: String } ]
	},
	{ timestamps: true }
);

const Post = mongoose.Schema(
	{
		message: String,
		createdBy: String
	},
	{ timestamps: true }
);

const Channel = mongoose.Schema(
	{
		name: String,
		description: String,
		createdBy: String,
		members: [ { userId: String } ],
		posts: [ { message: String, username: String, timestamp: String } ]
	},
	{ timestamps: true }
);

module.exports.Channel = mongoose.model('Channel', Channel);
module.exports.Post = mongoose.model('Post', Post);
module.exports.User = mongoose.model('User', User);
