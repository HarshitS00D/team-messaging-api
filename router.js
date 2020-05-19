const Router = require('express').Router();
const User = require('./schema').User;
const Channel = require('./schema').Channel;
const Invite = require('./schema').Invite;

Router.get('/', (req, res) => {
	res.send('server working');
});

Router.get('/get-user', async (req, res) => {
	await User.findOne({ _id: req.query.id })
		.then((result) => {
			res.send(result);
		})
		.catch((err) => {
			res.send(null);
			console.log(err);
		});
});

Router.post('/register', async (req, res) => {
	let result = await User.find({ $or: [ { email: req.body.email }, { username: req.body.username } ] });
	if (result.length) {
		if (result.length === 2) {
			let username = 'Username already taken';
			let email = 'Email already registered';
			res.send({ error: { username, email } });
		} else {
			let username = undefined;
			let email = undefined;

			if (result[0].username === req.body.username) username = 'Username already taken!';
			if (result[0].email === req.body.email) email = 'Email already Registered!';

			res.send({ error: { username, email } });
		}
	} else {
		let user = new User({
			email: req.body.email,
			username: req.body.username,
			password: req.body.password,
			region: req.body.region
		});

		await user
			.save()
			.then((data) => {
				res.send(data);
			})
			.catch((err) => console.log(err));
	}
});

Router.post('/login', async (req, res) => {
	let data = await User.find({
		username: req.body.username,
		password: req.body.password
	});

	res.send(data);
});

Router.post('/create-channel', async (req, res) => {
	let channel = new Channel({
		name: req.body.name,
		description: req.body.description,
		createdBy: req.body.createdBy,
		members: [ { username: req.body.createdBy } ],
		posts: []
	});

	await channel
		.save()
		.then((data) => {
			User.findOne({ username: req.body.createdBy }).then((result) => {
				result.memberOfChannels.push({ channelId: data._id });
				result.save();
			});

			res.send(data);
		})
		.catch((err) => console.log(err));
});

Router.get('/user/get-channels', (req, res) => {
	User.findOne({ _id: req.query.id }).then(async (data) => {
		let resArray = [];

		for (let i = 0; i < data.memberOfChannels.length; i++) {
			let res = await Channel.find({ _id: data.memberOfChannels[i].channelId });
			resArray.push(res[0]);
		}

		res.send(resArray);
	});
});

Router.get('/user/get-posts', (req, res) => {
	Channel.findOne({ _id: req.query.channelId })
		.then((data) => {
			res.send(data.posts);
		})
		.catch((err) => {
			console.log(err);
			res.send([]);
		});
});

Router.get('/user/get-invites', (req, res) => {
	Invite.find({ username: req.query.username }).then((result) => res.send(result)).catch((err) => {
		console.log(err);
		res.send([]);
	});
});

Router.post('/user/invite', async (req, res) => {
	let user = await User.findOne({ username: req.body.username });
	if (user) {
		let result = await User.findOne({
			username: req.body.username,
			'memberOfChannels.channelId': req.body.channelId
		});
		if (result) {
			res.send({ message: 'User already exist!' });
		} else {
			let data = await Invite.findOne({ username: req.body.username, channelId: req.body.channelId });
			if (data) {
				res.send({ message: 'User already Invited!' });
			} else {
				let invite = new Invite({
					username: req.body.username,
					channelId: req.body.channelId,
					channelName: req.body.channelName,
					sentBy: req.body.sentBy
				});

				await invite.save().then((result) => res.send({ message: 'User Invited!' })).catch((err) => {
					console.log(err);
					res.send({ message: 'Error! please try again.' });
				});
			}
		}
	} else res.send({ message: 'User does not exist' });
});

Router.post('/user/accept-invite', async (req, res) => {
	Invite.findOne({ _id: req.body.id }).then(async (result) => {
		User.findOne({ username: req.body.username })
			.then(async (user) => {
				user.memberOfChannels.push({ channelId: result.channelId });
				await user.save();
				Channel.findOne({ _id: result.channelId })
					.then(async (channel) => {
						channel.members.push({ username: user.username });
						await channel.save();
					})
					.catch((err) => console.log(err));
			})
			.catch((err) => console.log(err));
	});

	let result = await Invite.deleteOne({ _id: req.body.id });
	res.send(result);
});

Router.post('/user/decline-invite', async (req, res) => {
	let result = await Invite.deleteOne({ _id: req.body.id });
	res.send(result);
});

Router.get('/trending', async (req, res) => {
	let result = await Channel.aggregate([
		{
			$project: {
				name: 1,
				description: 1,
				post_count: { $size: { $ifNull: [ '$posts', [] ] } }
			}
		},
		{
			$sort: { post_count: -1 }
		},
		{
			$limit: 5
		}
	]);
	res.send(result);
});

Router.get('/trending/users', async (req, res) => {
	let result = await Channel.aggregate([
		{
			$project: { posts: 1 }
		},
		{
			$unwind: '$posts'
		},
		{
			$group: { _id: '$posts.username', count: { $sum: 1 } }
		},
		{
			$sort: { count: -1 }
		},
		{
			$limit: 5
		}
	]);

	res.send(result);
});

module.exports = Router;
