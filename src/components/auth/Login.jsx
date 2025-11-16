import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import "../../App.css";

function Login({ setCurrentScreen }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setCurrentScreen("dashboard");
      navigate("/");
    } catch (err) {
      let errorMessage = "Invalid email or password. Please try again.";
      if (err.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address.";
      } else if (err.code === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please try again.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email address. Please check and try again.";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-wellness">
      <div className="auth-card">
        <h3 className="auth-title">🌟 Welcome Back</h3>
        <form onSubmit={handleSubmit} className="auth-form">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="input"
            placeholder="your.email@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
            disabled={loading}
          />
          <label className="form-label">Password</label>
          <input
            type="password"
            className="input"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            disabled={loading}
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" className="button" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
        <div className="form-footer">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/forgot-password");
            }}
            className="forgot-link"
          >
            Forgot Password?
          </a>
          {" | "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/register");
            }}
            className="forgot-link"
          >
            Register
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;