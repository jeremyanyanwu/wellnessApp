import React, { useState } from "react";
import { Form, Button, Col, Navbar, Container } from "react-bootstrap";
import { motion as framerMotion } from "framer-motion";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../../App.css";

function Register({ onRegister, setTab }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: username });
      await setDoc(doc(db, "users", user.uid), {
        email,
        username,
        createdAt: new Date(),
      });

      onRegister();
      navigate("/dashboard");
    } catch (err) {
      setError("Failed to register. Please try again.");
    }
  };

  return (
    <>
      <Navbar bg="light" expand="md" className="shadow-sm">
        <Container className="justify-content-center">
          <Navbar.Brand className="fw-bold fs-3 text-primary">Wellness App</Navbar.Brand>
        </Container>
      </Navbar>

      <framerMotion.div className="auth-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease: "easeOut" }}>
        <framerMotion.div className="row w-100 m-0 h-100 g-0" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }}>
          <Col md={6} className="left-panel d-flex flex-column justify-content-center align-items-center p-5">
            <h1>🌿 Join Wellness</h1>
            <p>Create an account to start your wellness journey.</p>
          </Col>

          <Col xs={12} md={6} className="auth-right d-flex flex-column justify-content-center align-items-center p-5">
            <div className="auth-form-container">
              <h3 className="auth-title mb-4">Register Now 🚀</h3>
              <Form onSubmit={handleSubmit} className="auth-form">
                <Form.Group controlId="username" className="mb-4">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </Form.Group>

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

                <Button type="submit" className="auth-btn w-100">Register</Button>
              </Form>

              <div className="form-footer mt-3 text-center">
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setTab && setTab("login"); }}
                >
                  Already have an account? Login
                </a>
              </div>
            </div>
          </Col>
        </framerMotion.div>
      </framerMotion.div>
    </>
  );
}

export default Register;
