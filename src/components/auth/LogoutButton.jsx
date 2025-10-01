// src/components/auth/LogoutButton.jsx
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function LogoutButton({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      if (onLogout) onLogout();  // clear user state
      navigate("/");             // redirect to login
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Button variant="danger" onClick={handleLogout}>
      Logout
    </Button>
  );
}

export default LogoutButton;
