import React, { useState } from 'react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <>
          <h1>Login</h1>
          <form>
              <label htmlFor="email">Email: </label>
              <input type="text" name="email" onChange={(e) => setEmail(e.target.value)} />
              <label htmlFor="password">Password: </label>
              <input type="password" name="password" onChange={(e) => setPassword(e.target.value)} />
              <input type="submit" value="Login" />
          </form>
        </>
    );
};

export default Login;
