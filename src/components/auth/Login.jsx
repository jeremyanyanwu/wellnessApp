import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import "/src/App.css";

function Login({ setCurrentScreen }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setCurrentScreen("dashboard");
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password. Please try again. Error: " + err.message);
    }
  };

  return (
    <div className="bg-wellness">
      <div className="auth-card">
        <h3 className="auth-title">🌟 Welcome Back</h3>
        <form onSubmit={handleSubmit} className="auth-form">
          <Form.Group controlId="login-email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="your.email@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              className="form-control"
            />
          </Form.Group>
          <Form.Group controlId="login-password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="form-control"
            />
          </Form.Group>
          {error && <p className="error-message">{error}</p>}
          <Button type="submit" className="auth-btn">
            Sign In
          </Button>
        </form>
        <div className="form-footer">
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/forgot-password"); }} className="forgot-link">
            Forgot Password?
          </a>{" | "}
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/register"); }} className="forgot-link">
            Register
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;