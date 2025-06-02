const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.resolve('./public')));
app.get("/", (req, res, next) => {
    res.sendFile('index.html');
});

const users = {}; // Store user names by socket ID

io.on("connection", (socket) => {
    console.log(socket.id, "User is connected");

    // Listen for the user providing their name
    socket.on("setName", (name) => {
        users[socket.id] = name; // Save the user's name
        console.log(`${name} has joined the chat`);
    });

    socket.on("msgFromFrontend", (msg) => {
        const name = users[socket.id] || "Anonymous"; // Default to "Anonymous" if no name is set
        io.emit("msgFromBackend", `${name}: ${msg}`);
    });

    socket.on("disconnect", () => {
        console.log(`${users[socket.id] || "Anonymous"} has left the chat`);
        delete users[socket.id]; // Remove the user from the list
    });
});

server.listen(5001, () => {
    console.log("Server is running on localhost:5001");
});