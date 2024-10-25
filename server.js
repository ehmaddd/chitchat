const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let chatRooms = {};

// Serve static files
app.use(express.static('public'));

// Socket.io connection
io.on('connection', (socket) => {
    console.log('New user connected');

    // Create a new chatroom
    socket.on('createRoom', (roomName) => {
        if (!chatRooms[roomName]) {
            chatRooms[roomName] = [];
            socket.join(roomName);
            socket.emit('roomCreated', roomName);
            console.log(`Room created: ${roomName}`);
        } else {
            socket.emit('roomExists', roomName);
        }
    });

    // Join a chatroom
    socket.on('joinRoom', (roomName) => {
        if (chatRooms[roomName]) {
            socket.join(roomName);
            chatRooms[roomName].push(socket.id);
            socket.emit('joinedRoom', roomName);
            io.to(roomName).emit('message', `A new user has joined the room: ${roomName}`);
            console.log(`User joined room: ${roomName}`);
        } else {
            socket.emit('roomNotFound', roomName);
        }
    });

    // Send a message to a chatroom
    socket.on('sendMessage', (data) => {
        const { roomName, message } = data;
        io.to(roomName).emit('message', message);
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
