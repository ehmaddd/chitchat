// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'; // Import the CSS file

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/login', {
                email,
                password,
            });
            localStorage.setItem('token', response.data.token); // Store JWT
            // Redirect or show success message
            console.log('Login successful:', response.data);
        } catch (err) {
            setError('Invalid credentials, please try again.');
        }
    };

    return (
        <div className="container">
            <div className="form-container">
                <h2 className="title">Login</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        className="input"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        className="input"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="button">Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
