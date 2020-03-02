const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const mongoose = require('mongoose');
const Router = require('./router');
const cors = require('cors');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');

const PORT = process.env.PORT || 4000;

const app = express();
const server = http.Server(app);
const io = socketio(server);

mongoose.connect('mongodb+srv://harshitsood:harshit%4011@cluster0-u69rg.gcp.mongodb.net/team-messaging', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).catch(err => console.log(err));

mongoose.connection.once("open", () => console.log("Connected to MongoDB")).on("error", err => console.log(err));


app.use(cors({
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(Router);

io.on('connection', (socket) => {
    console.log('user has connected !!!');

    socket.on('join', ({ userId, username, channelId }, callback) => {
        const { user } = addUser({ id: socket.id, userId, username, channelId });

        console.log(userId, username, channelId);

        socket.emit('message', { user: 'admin', text: `${user.username}, Welcome to the channel ${user.channelId}` });
        socket.broadcast.to(user.channelId).emit('message', { user: 'admin', text: `${user.username}, has joined!` });

        //console.log(userId, username, channelId);
        socket.join(user.channelId);

        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);

        console.log(message);

        io.to(user.channelId).emit('message', { user: user.username, text: message });

        callback();
    })

    socket.on('disconnect', () => {
        console.log('user has left !!!');
    });
});



server.listen(PORT, () => { console.log(`Express listening on port ${PORT}`) });
