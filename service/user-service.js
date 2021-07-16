let users = [];

const USER_NOT_FOUND = -1;

const addUser = ({id, username, room}) => {
    const trimmedUsername = username.trim();
    const trimmedRoom = room.trim();

    const isUsernameTaken = users.find(user => user.room === room && user.username === username);
    if (isUsernameTaken)
        return {error: "Sorry! The username is already taken!"};

    if (!username || !room)
        return {error: "Username and room are required!"};

    const newUser = {id, username: trimmedUsername, room: trimmedRoom};

    users.push(newUser);

    return {newUser};
};

const removeUser = (id) => {
    const userToRemoveIndex = users.findIndex(user => user.id === id);

    if (userToRemoveIndex !== USER_NOT_FOUND)
        return users.splice(userToRemoveIndex, 1)[0];
};

const getUser = id => users.find(user => user.id === id);

const getUsersByRoom = room => users.filter(user => user.room === room);

module.exports = {addUser, removeUser, getUser, getUsersByRoom};