import React, { useState } from "react";
import { Form, Button, Col, Navbar, Container } from "react-bootstrap";
import { motion as framerMotion } from "framer-motion";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import "../../App.css";

function ForgotPassword({ setTab }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Check your inbox.");
      setTimeout(() => setTab && setTab("login"), 3000);
    } catch (err) {
      setError("Failed to send reset email. Check your email address.");
    }
  };

  return (
    <>
      <Navbar bg="light" expand="md" className="shadow-sm">
        <Container className="justify-content-center">
          <Navbar.Brand className="fw-bold fs-3 text-primary">Wellness App</Navbar.Brand>
        </Container>
      </Navbar>

      <framerMotion.div className="auth-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        <framerMotion.div className="row w-100 m-0 h-100 g-0" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }}>
          <Col md={6} className="left-panel d-flex flex-column justify-content-center align-items-center p-5">
            <h1>🌿 Forgot Password?</h1>
            <p>Enter your email to receive password reset instructions.</p>
          </Col>

          <Col xs={12} md={6} className="auth-right d-flex flex-column justify-content-center align-items-center p-5">
            <div className="auth-form-container">
              <h3 className="auth-title mb-4">Reset Password</h3>
              <Form onSubmit={handleSubmit} className="auth-form">
                <Form.Group controlId="email" className="mb-4">
  <Form.Label className="form-label">Email Address</Form.Label>
  <Form.Control
    type="email"
    placeholder="Enter your email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="form-input"
    required
    autoComplete="off"  
  />
</Form.Group>

                {error && <p className="text-danger text-center mb-3">{error}</p>}
                {message && <p className="text-success text-center mb-3">{message}</p>}

                <Button type="submit" className="auth-btn w-100">Send Reset Link</Button>
              </Form>

              <div className="form-footer mt-3 text-center">
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setTab && setTab("login"); }}
                >
                  Back to Login
                </a>
              </div>
            </div>
          </Col>
        </framerMotion.div>
      </framerMotion.div>
    </>
  );
}

export default ForgotPassword;
