import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e)=> {
      e.preventDefault();
      const response = await axios.post('http://localhost:3000/login', 
        {
          email,
          password
      });
      console.log(response);
    }

    return (
        <>
          <h1>Login</h1>
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