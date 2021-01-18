import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import axios from 'axios';

function Login(props) {

  const { login, setMessage, username, setRoute, showXButton, displayResendEmailLink } = props;
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (username) setEmailOrUsername(username);
    showXButton(true);
  });

  function validateForm() {
    return emailOrUsername.length > 0 && password.length > 0;
  };

  function handleSubmit(event) {

    const payload = {
      emailOrUsername,
      password,
    };

    console.log('submitted payload: ', payload);

    axios.post('/login', payload)
      .then(res => {
        /* when something about the input is wrong, server sends 202 with message */
        if (res.status === 202) {
          setMessage(res.data.message);
          if (res.data.email) {
            displayResendEmailLink({ email: res.data.email, username: res.data.username });
            setRoute('/blank');
          };
        } else if (res.status === 200) {
          console.log('logged user in successfully');
          login(res.data); // log user in & send user data
        };
      })
      .catch(err => {
        console.log('something broke trying to log user in', err.response);
      })

    event.preventDefault(); /** prevents it from refreshing */
  };

  return (
    <>
      {/* <button onClick={() => xout()}>X</button> */}

      <Form onSubmit={handleSubmit}>
        <Form.Group size="lg" controlId="emailOrUsername">
          <Form.Label>Email or Username</Form.Label>
          <Form.Control
            autoFocus
            type="text"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
          />
        </Form.Group>
        <Form.Group size="lg" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <div><button onClick={() => setRoute('/forgotPassword')}>Forgot your password?</button></div>

        <Button block size="lg" type="submit" disabled={!validateForm()}>
          Login
        </Button>
      </Form>

      <button onClick={() => setRoute('/signup')}>Sign Up</button>
    </>
  );
}

export default Login;