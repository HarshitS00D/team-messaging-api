const express = require('express');
const mongoose = require('mongoose');
const admin = require('os').userInfo().username;
const Router = require('./router');
const cors = require('cors');
const _ = require('lodash');
const Channel = require('./schema').Channel;

const PORT = process.env.PORT || 4000;

const app = express();

mongoose
	.connect(
		admin === 'Harshit Sood'
			? 'mongodb://localhost:27017/team-messaging'
			: 'mongodb+srv://harshitsood:harshit%4011@cluster0-u69rg.gcp.mongodb.net/team-messaging',
		{
			useNewUrlParser: true,
			useUnifiedTopology: true
		}
	)
	.catch((err) => console.log(err));

mongoose.connection.once('open', () => console.log('Connected to MongoDB')).on('error', (err) => console.log(err));

app.use(
	cors({
		origin: '*',
		credentials: true,
		optionsSuccessStatus: 200
	})
);
app.use(express.json());
app.use(Router);

const io = require('socket.io')(
	app.listen(PORT, () => {
		console.log(`Express listening on port ${PORT}`);
	})
);

io.on('connection', (socket) => {
	socket.on('join', ({ userId, username, channelId }) => {
		let rooms = _.omit(io.sockets.adapter.sids[socket.id], socket.id); //delete io.sockets.adapter.sids[socket.id][socket.id]
		for (let room in rooms) socket.leave(room);
		delete rooms;

		socket.join(channelId);
	});

	socket.on('new_message', (message, username, channelId, callback) => {
		//console.log(message, channelId);

		Channel.findOne({ _id: channelId })
			.then((result) => {
				let time = Date();
				let timestamp = time.substring(0, 25);

				io.to(channelId).emit('new_message_broadcast', { username, message, timestamp });

				result.posts.push({ message, username, timestamp });
				result.save();
			})
			.catch((err) => console.log(err));

		callback();
	});

	socket.on('disconnect', () => {
		console.log('user has left !!!');
	});
});
