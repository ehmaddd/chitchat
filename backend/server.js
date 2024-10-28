const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const pool = require('./db');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let chatRooms = {};

// Serve static files
app.use(express.static('public'));
app.use(cors());
app.use(bodyParser.json());

const users = [
    {
      id: 1,
      email: 'user@example.com',
      password: bcrypt.hashSync('password', 8), // hashed password
    },
  ];

// Route to access the database
const connectDb = async () => {
    try {
        const client = await pool.connect();
        if(client) {
            console.log('Connected to DB');
            client.release();
        }
        else {
            console.log('Not connected to DB');
        }
    } catch (err) {
        console.error('Error connecting to the database:', err);
    }
};

// Socket.io connection
io.on('connection', (socket) => {
    connectDb();

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

// Authentication route
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find((u) => u.email === email);
  
    if (!user) {
      return res.status(404).send({ message: 'User not found.' });
    }
  
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).send({ token: null, message: 'Invalid Password!' });
    }
  
    const token = jwt.sign({ id: user.id }, 'your_jwt_secret', { expiresIn: 86400 }); // 24 hours
    res.status(200).send({ id: user.id, email: user.email, token });
  });

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
