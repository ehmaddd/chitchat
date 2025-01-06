const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const socketJwt = require('socketio-jwt');
const pool = require('./db');

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

// Route to fetch rooms
app.get('/fetch_rooms', async (req, res) => {
  try {
      const result = await pool.query('SELECT * FROM rooms');
      const rooms = result.rows.map((row) => row.roomname);
      res.status(200).json({ rooms });
  } catch (error) {
      console.error('Error fetching rooms:', error);
      res.status(500).send('Error fetching rooms');
  }
});

// Fetch messages for a room
app.get('/rooms/:room/messages', async (req, res) => {
    const { room } = req.params;

    try {
        const targetroom = await pool.query('SELECT roomid FROM rooms WHERE roomname = $1', [room]);
        if (targetroom.rows.length === 0) {
            return res.status(404).send('Room not found');
        }

        const roomId = targetroom.rows[0].roomid;
        const result = await pool.query('SELECT * FROM messages WHERE roomid = $1', [roomId]);

        const messages = result.rows.map(row => ({
            text: row.content,
            sender: row.userid,
            date: row.createdat
        }));

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).send('Error fetching messages');
    }
});

app.post('/store_messages', async (req, res) => {
    const { room, message, userId } = req.body;
    console.log(room, message, userId);

    // if (!room || !message || !senderId) {
    //     return res.status(400).send('Room, message, and senderId are required');
    // }

    // try {
    //     // First, fetch the roomId from the rooms table
    //     const targetroom = await pool.query('SELECT roomid FROM rooms WHERE roomname = $1', [room]);
    //     console.log(targetroom);

    //     if (targetroom.rows.length === 0) {
    //         return res.status(404).send('Room not found');
    //     }

    //     const roomId = targetroom.rows[0].roomid;

    //     // Now, store the message in the messages table
    //     const result = await pool.query(
    //         'INSERT INTO messages (roomid, content, userid) VALUES ($1, $2, $3) RETURNING *',
    //         [roomId, message, senderId]
    //     );
    //     console.log(result);

    //     // Respond with success
    //     res.status(201).json({
    //         message: 'Message saved successfully',
    //         storedMessage: result.rows[0], // Return the saved message
    //     });
    // } catch (error) {
    //     console.error('Error saving message:', error);
    //     res.status(500).send('Error saving message');
    // }
});

// Use socketio-jwt to authenticate users via their JWT token
io.use(socketJwt.authorize({
    secret: 'your_jwt_secret',   // Your secret key
    handshake: true              // Allow the token to be used in the handshake
}));

// Socket.io connection
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('joinRoom', (roomName, callback) => {
        console.log(`Attempting to join room: ${roomName}`);
    
        if (chatRooms[roomName]) {
            socket.join(roomName);
            chatRooms[roomName].push(socket.id);
    
            callback('Successfully joined the room');
            io.to(roomName).emit('message', `A new user has joined the room: ${roomName}`);
            console.log(`User joined room: ${roomName}`);
        } else {
            callback('Room not found');
            console.log('Room not found:', roomName);
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
