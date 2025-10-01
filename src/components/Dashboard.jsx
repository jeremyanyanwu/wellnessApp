import React, { useState } from "react";
import { Container, Row, Col, Card, ProgressBar, ListGroup, Button, Navbar, Nav } from "react-bootstrap";
import { motion } from "framer-motion";
import LogoutButton from "./auth/LogoutButton";

const Dashboard = () => {
  const [score, setScore] = useState(75); // example score
  const [activeSection, setActiveSection] = useState("checkin");

  const renderSection = () => {
    switch (activeSection) {
      case "checkin":
        return (
          <Row className="justify-content-center">
            <Col md={10}>
              <Row>
                <Col md={4}>
                  <Card className="shadow-sm mb-4">
                    <Card.Body>
                      <Card.Title>Today's Wellness Score</Card.Title>
                      <ProgressBar now={score} label={`${score}/100`} className="mb-3" />
                      <p className="text-muted">Great job! Keep it up.</p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={8}>
                  <Card className="shadow-sm mb-4">
                    <Card.Body>
                      <Card.Title>Quick Check-In</Card.Title>
                      <ListGroup variant="flush">
                        <ListGroup.Item>😴 Sleep: 7 hours</ListGroup.Item>
                        <ListGroup.Item>😊 Mood: 8/10</ListGroup.Item>
                        <ListGroup.Item>💧 Hydration: 6/8 cups</ListGroup.Item>
                        <ListGroup.Item>⚡ Stress: 3/10</ListGroup.Item>
                        <ListGroup.Item>🔥 Activity: 45 minutes</ListGroup.Item>
                      </ListGroup>
                      <Button
                        variant="primary"
                        className="mt-3 w-100"
                        onClick={() => alert("Check-in updated!")}
                      >
                        Update Check-In
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row>
                <Col md={12}>
                  <Card className="shadow-sm">
                    <Card.Body>
                      <Card.Title>Daily Habits</Card.Title>
                      <p className="text-muted">Track your progress and get personalized tips.</p>
                      <Button
                        variant="success"
                        className="me-2"
                        onClick={() => alert("Habit logged!")}
                      >
                        Log Habit
                      </Button>
                      <Button
                        variant="outline-secondary"
                        onClick={() => alert("Here are your wellness tips!")}
                      >
                        View Tips
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        );
      case "mental":
        return (
          <Card className="shadow-sm p-4">
            <Card.Title>Mental Health</Card.Title>
            <p>Track your mood, stress, and mindfulness activities here.</p>
            <Button onClick={() => alert("Open mental exercises!")}>Open Exercises</Button>
          </Card>
        );
      case "profile":
        return (
          <Card className="shadow-sm p-4">
            <Card.Title>Profile</Card.Title>
            <p>View and edit your personal information.</p>
            <Button onClick={() => alert("Edit profile!")}>Edit Profile</Button>
          </Card>
        );
      case "ai":
        return (
          <Card className="shadow-sm p-4">
            <Card.Title>AI Insights</Card.Title>
            <p>Get personalized wellness tips powered by AI.</p>
            <Button onClick={() => alert("Show AI insights!")}>Show Insights</Button>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-vh-100"
      style={{ background: "linear-gradient(135deg, #e6e6fa, #d1c4e9)" }}
    >
      <Navbar bg="light" expand="lg" className="shadow-sm mb-4">
        <Container>
          <Navbar.Brand className="fw-bold text-primary">🌿 Wellness Dashboard</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link onClick={() => setActiveSection("checkin")}>Check-In</Nav.Link>
              <Nav.Link onClick={() => setActiveSection("mental")}>Mental</Nav.Link>
              <Nav.Link onClick={() => setActiveSection("profile")}>Profile</Nav.Link>
              <Nav.Link onClick={() => setActiveSection("ai")}>AI Insights</Nav.Link>
              <Nav.Link className="ms-2"><LogoutButton /></Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="py-3">{renderSection()}</Container>
    </motion.div>
  );
};

export default Dashboard;
