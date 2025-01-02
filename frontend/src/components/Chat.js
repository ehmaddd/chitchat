import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation between pages
import { io } from 'socket.io-client';

const Chat = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [room, setRoom] = useState('');
    const [rooms, setRooms] = useState([]); // List of rooms
    const [roomJoined, setRoomJoined] = useState(false);
    const socket = useRef(null);
    const navigate = useNavigate(); // For navigation to other pages

    useEffect(() => {
        // Check if the user is logged in (using localStorage/sessionStorage or cookies)
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        if (!isAuthenticated) {
            navigate('/login'); // Redirect to login if not authenticated
        }

        // Initialize socket connection
        socket.current = io('http://localhost:3000');

        // Listen for incoming messages
        socket.current.on('message', (msg) => {
            console.log('Received message:', msg); // Debug log
            setMessages((prev) => [...prev, msg]); // Add new message to the state
        });

        // Listen for room list updates
        socket.current.on('roomList', (availableRooms) => {
            setRooms(availableRooms);
        });

        return () => {
            socket.current.disconnect();
        };
    }, [navigate]);

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

    const handleJoinRoom = async (selectedRoom) => {
        console.log(`Attempting to join room: ${selectedRoom}`); // Debug log
    
        try {
            const response = await fetch(`http://localhost:3000/rooms/${selectedRoom}/messages`);
            if (!response.ok) {
                console.error('Failed to fetch messages:', response.statusText);
                return;
            }
            const data = await response.json();
            setMessages(data); // Update the messages state
            console.log('Messages fetched:', data);
            setRoom(selectedRoom); // Set the current room
            setRoomJoined(true); // Mark room as joined
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSendMessage = async () => {
        if (message && room) {
            // Add the message to local state first to immediately show it in UI
            const newMessage = { text: message, sender: 'User' };
            setMessages((prev) => [...prev, newMessage]); // Optimistic update

            // Send message to server via socket (for other clients)
            socket.current.emit('sendMessage', { roomName: room, message });

            // Send message to backend to store in DB
            try {
                const response = await fetch('http://localhost:3000/store_messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ room: room, message: message }),
                });
                console.log(response);

                if (!response.ok) {
                    console.error('Error storing message in DB:', response.statusText);
                } else {
                    console.log('Message successfully stored in DB');
                }
            } catch (error) {
                console.error('Error sending message to backend:', error);
            }

            setMessage(''); // Clear input after sending message
        }
    };

    const handleLogout = () => {
        // Clear authentication token or session
        localStorage.removeItem('isAuthenticated');
        navigate('/login'); // Redirect to login page after logout
    };

    const handleBackToMainPage = () => {
        setRoomJoined(false); // Reset the roomJoined state to show the room list again
        setMessages([]); // Optionally clear the messages
        setRoom(''); // Reset the selected room
    };

    return (
        <div>
            <h1>Chat</h1>
            <button onClick={handleLogout}>Logout</button>
            {!roomJoined ? (
                <div>
                    <input
                        type="text"
                        placeholder="Enter room name"
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                    />
                    <button onClick={handleCreateRoom}>Create Room</button>
                    <h2>Available Rooms</h2>
                    <ul>
                        {Array.isArray(rooms) ? (
                            rooms.map((room, index) => (
                                <li key={index}>
                                    {room}{' '}
                                    <button onClick={() => handleJoinRoom(room)}>Join</button>
                                </li>
                            ))
                        ) : (
                            <li>No rooms available</li>
                        )}
                    </ul>
                </div>
            ) : (
                <div>
                    <button onClick={handleBackToMainPage}>Back to Room List</button>
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
                    {messages.length > 0 ? (
                        messages.map((msg, index) => (
                            <li key={index}>
                                {msg.text} - {msg.sender}
                            </li>
                        ))
                    ) : (
                        <li>No messages yet</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default Chat;
