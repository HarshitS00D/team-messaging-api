const users = [];

const addUser = ({ id, userId, username, channelId }) => {


    for (let i = 0; i < users.length; i++) {
        if (users[i].userId === userId && users[i].channelId === channelId) {
            console.log('existing user');
            let user = { id, userId, username, channelId };
            return { user };
        }
    }

    const user = { id, userId, username, channelId };

    users.push(user);
    console.log(users, "user added")
    return { user };
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInChannel = (channelId) => users.filter((user) => user.channelId === channelId);

module.exports = { addUser, removeUser, getUser, getUsersInChannel };