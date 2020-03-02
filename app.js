const express = require('express');
const mongoose = require('mongoose');
const admin = require('os').userInfo().username;
const Router = require('./router');
const cors = require('cors');
const _ = require('lodash');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');

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
	socket.on('join', ({ userId, username, channelId }, callback) => {
		let rooms = _.omit(io.sockets.adapter.sids[socket.id], socket.id); //delete io.sockets.adapter.sids[socket.id][socket.id]
		for (let room in rooms) socket.leave(room);
		delete rooms;

		socket.join(channelId);
		console.log(username, io.sockets.adapter.sids[socket.id]);

		// const { user } = addUser({ id: socket.id, userId, username, channelId });

		// //console.log('user has joined !!!');

		// socket.emit('message', { user: 'admin', text: ` Welcome to the channel ${user.username}` });
		// socket.broadcast.to(user.channelId).emit('message', { user: 'admin', text: `${user.username}, has joined!` });

		// //console.log(userId, username, channelId);
		// socket.join(user.channelId);

		// callback();
	});

	socket.on('new_message', (message, username, channelId, callback) => {
		//console.log(message, channelId);

		io.to(channelId).emit('new_message_broadcast', { username, text: message });

		callback();
	});

	socket.on('disconnect', () => {
		console.log('user has left !!!');
	});
});
