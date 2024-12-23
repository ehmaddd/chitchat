import React, { useState } from 'react';
import axios from 'axios';
import Chat from './Chat';
import './Login.css';
import { useNavigate } from 'react-router-dom';  // Import useNavigate from react-router-dom

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState('');
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/login', {
        email,
        password
      });

      if (response.data.id) {
        setResult('Login Successful');
        setIsLoggedIn(true); // Navigate to chat page upon success
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
          <input type="text" name="email" onChange={(e) => setEmail(e.target.value)} />
          <br />
          <label htmlFor="password">Password: </label>
          <input type="password" name="password" onChange={(e) => setPassword(e.target.value)} />
          <br />
          <input type="submit" value="Login" onClick={handleSubmit} />
        </form>
       </>
       ) : (
        <>
          <Chat />
          <button onClick={logout}>LogOut</button>
        </>
       )}
    </>
  );
};

export default Login;
