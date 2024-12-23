import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const Chat = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [room, setRoom] = useState('');
    const socket = io('http://localhost:3000'); // Connect to Socket.IO server

    useEffect(() => {
        socket.on('message', (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => {
            socket.disconnect(); // Cleanup on component unmount
        };
    }, [socket]);

    const handleJoinRoom = () => {
        if (room) {
            socket.emit('joinRoom', room);
        }
    };

    const handleSendMessage = () => {
        if (message && room) {
            socket.emit('sendMessage', { roomName: room, message });
            setMessage(''); // Clear input after sending
        }
    };

    return (
        <div>
            <h1>Chat</h1>
            <div>
                <input
                    type="text"
                    placeholder="Enter room name"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                />
                <button onClick={handleJoinRoom}>Join Room</button>
            </div>
            <div>
                <input
                    type="text"
                    placeholder="Enter message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
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
