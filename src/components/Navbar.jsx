import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { FaMoon, FaSun } from "react-icons/fa";

function AppNavbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="w-100">
      <Container fluid>
        <Navbar.Brand as={Link} to="/">
          Sports Tracker
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-nav" aria-label="Toggle navigation menu" />

        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/myteams">My Teams</Nav.Link>
            <Nav.Link as={Link} to="/highlights">Highlights</Nav.Link>
            <Nav.Link as={Link} to="/favorites">Favorites</Nav.Link>
            <Nav.Link as={Link} to="/about">About</Nav.Link>
          </Nav>
          <Nav>
            <Button
              variant="outline-light"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              style={{
                borderRadius: "12px",
                padding: "0.5rem 1rem",
                marginLeft: "1rem",
                border: "2px solid rgba(255, 255, 255, 0.3)",
                transition: "all 0.2s ease"
              }}
            >
              {theme === "light" ? <FaMoon /> : <FaSun />}
              <span className="ms-2 d-none d-md-inline">
                {theme === "light" ? "Dark" : "Light"} Mode
              </span>
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
export default AppNavbar;