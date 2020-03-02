const Router = require('express').Router();
const User = require('./schema').User;
const Post = require('./schema').Post;
const Channel = require('./schema').Channel;

Router.get('/',(req,res) => {
    res.send("working!");
});

Router.get('/get-user', async (req, res) => {
    await User.findOne({ _id: req.query.id }).then(result => {
        res.send(result);
    }).catch(err => {
        res.send(null);
        console.log(err);
    });

});

Router.post('/register', async (req, res) => {
    let user = new User({
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        region: req.body.region
    });

    await user.save().then(data => {
        res.send(data);
    }).catch(err => console.log(err));

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
        members: [{ userId: req.body.createdBy }],
        posts: []
    });

    await channel.save().then(data => {
        User.findOne({ _id: req.body.createdBy }).then(result => {
            result.memberOfChannels.push({ channelId: data._id });
            result.save();
        });

        res.send(data);
    }).catch(err => console.log(err));


});

Router.get('/user/get-channels', (req, res) => {

    User.findOne({ _id: req.query.id }).then(async data => {
        let resArray = [];

        for (let i = 0; i < data.memberOfChannels.length; i++) {
            let res = await Channel.find({ _id: data.memberOfChannels[i].channelId });
            resArray.push(res[0]);
        }


        res.send(resArray);

    });
});

Router.post('/user/addUser', async (req, res) => {
    let user = await User.findOne({ username: req.body.username });
    if (user) {

        let result = await User.findOne({ username: req.body.username, 'memberOfChannels.channelId': req.body.channelId });

        if (result) {
            res.send({ message: 'user already exist' });
        }
        else {
            user.memberOfChannels.push({ channelId: req.body.channelId });
            await user.save();

            let channel = await Channel.findOne({ _id: req.body.channelId });
            channel.members.push({ userId: user._id });
            await channel.save();

            res.send({ message: "User added!" });
        }
    }
    else res.send({ message: "User does not exist" });

});

module.exports = Router;
