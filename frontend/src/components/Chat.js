import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const Chat = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [room, setRoom] = useState('');
    const [rooms, setRooms] = useState([]); // List of rooms
    const [roomJoined, setRoomJoined] = useState(false);
    const socket = useRef(null);

    useEffect(() => {
        // Initialize socket connection
        socket.current = io('http://localhost:3000');

        // Listen for incoming messages
        socket.current.on('message', (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        // Listen for room list updates
        socket.current.on('roomList', (availableRooms) => {
            setRooms(availableRooms);
        });

        return () => {
            socket.current.disconnect();
        };
    }, []);

    const fetchRooms = async () => {
        try {
            const response = await fetch('http://localhost:3000/fetch_rooms');
            const data = await response.json();
            if (Array.isArray(data.rooms)) {
                setRooms(data.rooms); // Set rooms state with the fetched array
            } else {
                console.error('Unexpected response format:', data);
                setRooms([]); // Fallback to an empty array
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
            setRooms([]); // Fallback to an empty array on error
        }
    };
    useEffect(() => {
        fetchRooms();
    }, []);

    const handleCreateRoom = () => {
        if (room) {
            socket.current.emit('createRoom', room, (response) => {
                if (response === 'Room created') {
                    fetchRooms(); // Refresh room list
                }
            });
        }
    };

    const handleJoinRoom = (selectedRoom) => {
        socket.current.emit('joinRoom', selectedRoom, (response) => {
            if (response === 'Room joined') {
                setRoomJoined(true);
                setRoom(selectedRoom);

                // Fetch previous messages for the room
                fetch(`http://localhost:3000/api/rooms/${selectedRoom}/messages`)
                    .then((res) => res.json())
                    .then((data) => setMessages(data));
            }
        });
    };

    const handleSendMessage = () => {
        if (message && room) {
            socket.current.emit('sendMessage', { roomName: room, message });
            setMessage('');
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
                    <button onClick={handleCreateRoom}>Create Room</button>
                    <button onClick={fetchRooms}>Fetch Rooms</button>
                    <h2>Available Rooms</h2>
                    <ul>
                      {Array.isArray(rooms) ? (
                          rooms.map((room, index) => <li key={index}>{room}</li>)
                      ) : (
                          <li>No rooms available</li>
                      )}
                    </ul>
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
