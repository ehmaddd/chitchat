const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const socketJwt = require('socketio-jwt'); // Ensure this is imported correctly

const app = express();
const server = http.createServer(app);

let chatRooms = {};

const corsOptions = {
    origin: 'http://localhost:3001',
    methods: ["GET", "POST"],
    credentials: true,
};

const io = socketIo(server, {
    cors: corsOptions
});

// Serve static files
app.use(express.static('public'));
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.json());

const users = [
    {
        id: 1,
        email: 'ehmaddd@gmail.com',
        password: bcrypt.hashSync('abc', 8),
    },
];

// Route to authenticate users
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find((u) => u.email === email);

    if (!user) {
        return res.status(401).send('User not found');
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
        return res.status(401).send('Wrong password');
    }

    const token = jwt.sign({ id: user.id }, 'your_jwt_secret', { expiresIn: 86400 });
    res.status(200).send({ id: user.id, email: user.email, token });
});

// Use socketio-jwt to authenticate users via their JWT token
io.use(socketJwt.authorize({
    secret: 'your_jwt_secret',   // Your secret key
    handshake: true              // Allow the token to be used in the handshake
}));

// Socket.io connection
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

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

    socket.on('sendMessage', (data) => {
        const { roomName, message } = data;
        io.to(roomName).emit('message', message);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
