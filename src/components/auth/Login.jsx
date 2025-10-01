import React, { useState } from "react";
import { Form, Button, Col, Navbar, Container } from "react-bootstrap";
import { motion as framerMotion } from "framer-motion";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebaseConfig";
import "../../App.css";

function Login({ onLogin, setTab }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin();              // update user state in App
      navigate("/dashboard"); // redirect to dashboard
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <>
      <Navbar bg="light" expand="md" className="shadow-sm">
        <Container className="justify-content-center">
          <Navbar.Brand className="fw-bold fs-3 text-primary">Wellness App</Navbar.Brand>
        </Container>
      </Navbar>

      <framerMotion.div
        className="auth-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <framerMotion.div
          className="row w-100 m-0 h-100 g-0"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Col md={6} className="left-panel d-flex flex-column justify-content-center align-items-center p-5">
            <h1>🌿 Focus on Wellness</h1>
            <p>Login to track your daily habits and boost your wellness journey.</p>
          </Col>

          <Col xs={12} md={6} className="auth-right d-flex flex-column justify-content-center align-items-center p-5">
            <div className="auth-form-container">
              <h3 className="auth-title mb-4">Welcome Back 👋</h3>
              <Form onSubmit={handleSubmit} className="auth-form">
                <Form.Group controlId="email" className="mb-4">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="password" className="mb-4">
  <Form.Label className="form-label">Password</Form.Label>
  <Form.Control
    type="password"
    placeholder="Enter your password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="form-input"
    required
    autoComplete="new-password"  
  />
</Form.Group>

                {error && <p className="text-danger text-center mb-3">{error}</p>}

                <Button type="submit" className="auth-btn w-100">Login</Button>
              </Form>

              <div className="form-footer mt-3 text-center">
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setTab && setTab("forgot"); }}
                >
                  Forgot Password?
                </a>{" | "}
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setTab && setTab("register"); }}
                >
                  Register
                </a>
              </div>
            </div>
          </Col>
        </framerMotion.div>
      </framerMotion.div>
    </>
  );
}

export default Login;
