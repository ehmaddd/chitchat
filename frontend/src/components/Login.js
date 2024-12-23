import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Login.css';
import Chat from './Chat';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [result, setResult] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleSubmit = async (e)=> {
      e.preventDefault();
      try {
        const response = await axios.post('http://localhost:3000/login', 
        {
          email,
          password
        });
        if(response.data.id){
          setResult('Login Successful');
          setIsLoggedIn(true);
          console.log(response.data);
        }
        else {
          setResult('Login Failed');
          setIsLoggedIn(false);
        }
      } catch {
        setResult('Login Failed');
        setIsLoggedIn(false);
      }
    }

    const logout = () => {
      setEmail('');
      setPassword('');
      setResult('');
      setIsLoggedIn(false);
    }

    return (
        <>
          {!isLoggedIn ? (
          <>
          <h1>Login</h1>
          <p className={(result==='Login Successful')?'message-success':'message-failure'} >{result}</p>
            <form>
                <label htmlFor="email">Email: </label>
                <input type="text" name="email" onChange={(e) => setEmail(e.target.value)} />
                <br></br>
                <label htmlFor="password">Password: </label>
                <input type="password" name="password" onChange={(e) => setPassword(e.target.value)} />
                <br></br>
                <input type="submit" value="Login" onClick={(e)=>handleSubmit(e)} />
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