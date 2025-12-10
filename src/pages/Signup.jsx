import { useState } from "react";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup, continueAsGuest } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      signup(username, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <Card style={{ width: "100%", maxWidth: "400px", borderRadius: "16px" }}>
        <Card.Body style={{ padding: "2rem" }}>
          <Card.Title as="h2" className="text-center mb-4">
            Sign Up
          </Card.Title>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="username">Username</Form.Label>
              <Form.Control
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter username (min 3 characters)"
                style={{ borderRadius: "12px" }}
                minLength={3}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label htmlFor="password">Password</Form.Label>
              <Form.Control
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter password (min 4 characters)"
                style={{ borderRadius: "12px" }}
                minLength={4}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label htmlFor="confirmPassword">Confirm Password</Form.Label>
              <Form.Control
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm password"
                style={{ borderRadius: "12px" }}
              />
            </Form.Group>

            <Button
              type="submit"
              variant="primary"
              className="w-100 mb-3"
              disabled={loading}
              style={{ borderRadius: "12px", padding: "0.75rem" }}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </Button>
          </Form>

          <div className="text-center">
            <p className="mb-2">
              Already have an account? <Link to="/login">Login</Link>
            </p>
            <p className="mb-0">
              <Link to="/" onClick={(e) => {
                e.preventDefault();
                continueAsGuest();
                navigate("/");
              }}>
                Continue as Guest
              </Link>
            </p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

