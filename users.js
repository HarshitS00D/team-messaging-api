const users = [];

const addUser = ({ id, userId, username, channelId }) => {
    const user = { id, userId, username, channelId };

    users.push(user);
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