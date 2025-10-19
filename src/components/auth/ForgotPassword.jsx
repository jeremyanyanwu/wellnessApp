export default function ForgotPassword({ setCurrentScreen }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    // Add Firebase reset password logic here
    setMessage("Reset link sent! Check your email.");
  };

  return (
    <div className="auth-card">
      <h3 className="auth-title">Forgot Password</h3>
      <form className="auth-form" onSubmit={handleReset}>
        <label className="form-label">Email</label>
        <input
          type="email"
          className="form-control"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <button type="submit" className="auth-btn">
          Reset Password
        </button>
        {message && <p className="success-message">{message}</p>}
        <div className="form-footer">
          <a href="/login" className="forgot-link" onClick={() => setCurrentScreen("login")}>
            Back to Login
          </a>
        </div>
      </form>
    </div>
  );
}