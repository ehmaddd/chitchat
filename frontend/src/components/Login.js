import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import Chat from './Chat';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState('');
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/login', {
        email,
        password
      });

      if (response.data.id) {
        setResult('Login Successful');
        setIsLoggedIn(true);
        // Store userId in localStorage after successful login
        localStorage.setItem('userId', response.data.id); // Save user ID here
        navigate('/chat'); // Navigate to the chat page
      } else {
        setResult('Login Failed');
      }
    } catch (error) {
      setResult('Login Failed');
      console.error(error);
    }
  };

  return (
    <>
      {!isLoggedIn ? (
        <>
          <h1>Login</h1>
          <p className={result === 'Login Successful' ? 'message-success' : 'message-failure'}>
            {result}
          </p>
          <form>
            <label htmlFor="email">Email: </label>
            <input
              type="text"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <br />
            <label htmlFor="password">Password: </label>
            <input
              type="password"
              name="password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <br />
            <input type="submit" value="Login" onClick={handleSubmit} />
          </form>
        </>
      ) : (
        <>
          <Chat />
        </>
      )}
    </>
  );
};

export default Login;
