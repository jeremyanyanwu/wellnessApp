import { Navbar, Nav, Container } from "react-bootstrap";
import { Link } from "react-router-dom";

const DashboardNavbar = () => (
  <Navbar bg="light" expand="lg" className="mb-4 shadow-sm">
    <Container>
      <Navbar.Brand as={Link} to="/dashboard">🌿 Wellness</Navbar.Brand>
      <Nav className="me-auto">
        <Nav.Link as={Link} to="/dashboard">Check-In</Nav.Link>
        <Nav.Link as={Link} to="/profile">👤 Profile</Nav.Link>
        <Nav.Link as={Link} to="#">🧠 Mental</Nav.Link>
        <Nav.Link as={Link} to="#">📊 AI Insights</Nav.Link>
      </Nav>
    </Container>
  </Navbar>
);

export default DashboardNavbar;
