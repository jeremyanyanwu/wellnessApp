import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import "../../App.css";

export default function ForgotPassword({ setCurrentScreen }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Check your inbox and spam folder.");
      setEmail(""); // Clear email after successful send
    } catch (err) {
      let errorMessage = "Failed to send reset email. Please try again.";
      if (err.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email address. Please check and try again.";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Too many requests. Please try again later.";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-wellness">
      <div className="auth-card">
        <h3 className="auth-title">🔒 Reset Password</h3>
        <p style={{ textAlign: "center", marginBottom: "1.5rem", color: "#666" }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <form className="auth-form" onSubmit={handleReset}>
          <label className="form-label">Email</label>
          <input
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@university.edu"
            required
            autoComplete="username"
            disabled={loading}
          />
          {error && <p className="error">{error}</p>}
          {message && <p className="success-message">{message}</p>}
          <button type="submit" className="button" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
          <div className="form-footer">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
              className="forgot-link"
            >
              Back to Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}