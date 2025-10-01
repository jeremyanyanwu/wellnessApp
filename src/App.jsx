import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Container, Tabs, Tab, Card, ListGroup, ProgressBar, Row, Col, Button } from "react-bootstrap";
import { auth } from "./firebaseConfig";

import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ForgotPassword from "./components/auth/ForgotPassword";
import LogoutButton from "./components/auth/LogoutButton";
import CheckInForm from "./components/CheckInForm";
import Dashboard from "./components/Dashboard";
import { calculateScore } from "./utils/scoreCalculator";

function AuthWrapper() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [checkinData, setCheckinData] = useState(null);
  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) navigate("/dashboard");
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleCheckInSubmit = (data) => {
    setCheckinData(data);
    console.log("Check-In Submitted:", data);
  };

  const wellnessScore = checkinData ? calculateScore(checkinData) : null;

  return (
    <Container className="mt-4">
      <h1 className="text-center mb-4">Focus on Wellness</h1>

      {!user ? (
        <Row className="justify-content-center">
          <Col xs={12} md={6}>
            <Card className="shadow-sm">
              <Card.Body>
                <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3" fill>
                  <Tab eventKey="login" title="Login">
                    <Login onLogin={() => setUser(auth.currentUser)} setTab={setActiveTab} />
                  </Tab>
                  <Tab eventKey="register" title="Register">
                    <Register onRegister={() => setUser(auth.currentUser)} setTab={setActiveTab} />
                  </Tab>
                  <Tab eventKey="forgot" title="Forgot Password">
                    <ForgotPassword setTab={setActiveTab} />
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Welcome, {user.email}</h3>
            <LogoutButton onLogout={() => setUser(null)} />
          </div>

          <Card className="p-3 shadow-sm mb-4">
            <CheckInForm onSubmit={handleCheckInSubmit} />
          </Card>

          {checkinData && (
            <Card className="p-3 shadow-sm mb-4">
              <h4 className="mb-3">Today's Wellness Stats</h4>
              <ListGroup variant="flush">
                <ListGroup.Item>😴 Sleep: {checkinData.sleep} hours</ListGroup.Item>
                <ListGroup.Item>😊 Mood: {checkinData.mood}/10</ListGroup.Item>
                <ListGroup.Item>💧 Hydration: {checkinData.hydration} cups</ListGroup.Item>
                <ListGroup.Item>⚡ Stress: {checkinData.stress}/10</ListGroup.Item>
                <ListGroup.Item>🔥 Activity: {checkinData.activity} minutes</ListGroup.Item>
              </ListGroup>

              {wellnessScore && (
                <Card className="mt-3 p-3">
                  <h5>Your Wellness Score</h5>
                  <ProgressBar now={wellnessScore} label={`${wellnessScore}/100`} />
                </Card>
              )}
            </Card>
          )}

          {/* Functional dashboard buttons */}
          <div className="d-flex flex-column flex-md-row gap-2 mt-3">
            <Button
              variant="primary"
              className="w-100"
              onClick={() => alert("Check-in updated!")}
            >
              Update Check-In
            </Button>

            <Button
              variant="success"
              className="w-100"
              onClick={() => alert("Habit logged!")}
            >
              Log Habit
            </Button>

            <Button
              variant="outline-secondary"
              className="w-100"
              onClick={() => alert("Here are your wellness tips!")}
            >
              View Tips
            </Button>
          </div>
        </div>
      )}
    </Container>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthWrapper />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
