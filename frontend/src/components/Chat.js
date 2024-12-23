import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const Chat = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [room, setRoom] = useState('');
    const [roomJoined, setRoomJoined] = useState(false); // Track if room is joined
    const socket = useRef(null); // Store socket instance

    useEffect(() => {
        // Initialize socket connection when the component mounts
        socket.current = io('http://localhost:3000'); // Connect to Socket.IO server

        // Listen for incoming messages from the server
        socket.current.on('message', (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        // Cleanup socket connection when the component unmounts
        return () => {
            socket.current.disconnect();
        };
    }, []);

    const handleJoinRoom = () => {
        if (room) {
            socket.current.emit('joinRoom', room, (response) => {
                if (response === 'Room joined') {
                    setRoomJoined(true);
                } else {
                    setRoomJoined(false);
                }
            });
        }
    };

    const handleSendMessage = () => {
        if (message && room) {
            socket.current.emit('sendMessage', { roomName: room, message });
            setMessage(''); // Clear input after sending
        }
    };

    return (
        <div>
            <h1>Chat</h1>
            {!roomJoined ? (
                <div>
                    <input
                        type="text"
                        placeholder="Enter room name"
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                    />
                    <button onClick={handleJoinRoom}>Join Room</button>
                </div>
            ) : (
                <div>
                    <h2>Welcome to the room: {room}</h2>
                    <div>
                        <input
                            type="text"
                            placeholder="Enter message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button onClick={handleSendMessage}>Send</button>
                    </div>
                </div>
            )}

            <div>
                <h2>Messages</h2>
                <ul>
                    {messages.map((msg, index) => (
                        <li key={index}>{msg}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Chat;
