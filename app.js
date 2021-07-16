const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv").config();

const router = require("./router/router");
const {addUser, removeUser, getUser, getUsersByRoom} = require("./service/user-service");

const PORT = process.env.PORT || 5000;
const SERVER_URL = process.env.SERVER_URL;

const app = express();
const server = http.createServer(app);

// Needed for CORS support
const io = socketio(server, {cors: {origin: '*'}});

app.use(router);
app.use(cors);

io.on(process.env.ON_CONNECTION, (socket) => {
    console.log("A new user connected!");

    socket.on(process.env.ON_JOIN, ({username, room}, callback) => {
        console.log(`Adding user: ${username}`);

        const {error, newUser} = addUser({id: socket.id, username, room});

        if (error)
            return callback({error});

        console.log("Sending messages for the user joining");

        // Sends a welcome message to the user who's joining
        socket.emit(process.env.ON_MESSAGGE, {
            user: process.env.ADMIN,
            content: `Welcome to ${newUser.room}, ${newUser.username}!`
        });

        // Sends a message to anyone other than the user sending it
        socket.broadcast.to(newUser.room).emit(process.env.ON_MESSAGE, {
            user: process.env.ADMIN,
            content: `${newUser.username} has joined ${newUser.room}!`
        });

        console.log(`Joining the user: ${newUser.username} into chat: ${newUser.room}`);

        // Adds an user to a room
        socket.join(newUser.room);

        callback();
    });

    socket.on(process.env.SEND_MESSAGE, (message, callback) => {
        const user = getUser(socket.id);

        console.log(`Sending the message ${message} by ${user.username} in ${user.room}`);

        // Sends to FE all the messages that receives so that
        // it can accumulate them and build the chat feed,
        // which will be composed by the messages
        io.to(user.room).emit(process.env.ON_MESSAGE, {user: user.username, content: message});

        callback();
    });

    socket.on(process.env.ON_DISCONNECT, () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit(process.env.ON_MESSAGE, {
                user: process.env.ADMIN,
                content: `${user.name} has left!`
            });

            console.log(`${user.username} left!`);
        }
    });
});

server.listen(PORT, () => console.log(`Server running on ${SERVER_URL}:${PORT}`));