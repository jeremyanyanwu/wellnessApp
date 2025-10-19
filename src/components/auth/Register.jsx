export default function Register({ setCurrentScreen }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    // Add Firebase register logic here
    setMessage("Registration successful! Please log in.");
  };

  return (
    <div className="auth-card">
      <h3 className="auth-title">Register</h3>
      <form className="auth-form" onSubmit={handleRegister}>
        <label className="form-label">Email</label>
        <input
          type="email"
          className="form-control"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <label className="form-label">Password</label>
        <input
          type="password"
          className="form-control"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password"
          required
        />
        <button type="submit" className="auth-btn">
          Register
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