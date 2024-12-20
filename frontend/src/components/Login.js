import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [result, setResult] = useState('');

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
          console.log(response.data);
        }
        else {
          setResult('Login Failed');
        }
      } catch {
        setResult('Login Failed');
      }
    }

    return (
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
    );
};

export default Login;