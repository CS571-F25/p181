import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { Container } from "react-bootstrap";
import AppNavbar from "./components/Navbar";
import Home from "./pages/Home";
import Highlights from "./pages/Highlights";
import AboutMe from "./pages/AboutMe";
import MyTeams from "./pages/MyTeams";
import Favorites from "./pages/Favorites";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  // Handle trailing slash redirect in development
  useEffect(() => {
    const currentPath = window.location.pathname;
    // If we're at /p181 (without trailing slash), redirect to /p181/
    if (currentPath === "/p181" && !currentPath.endsWith("/")) {
      window.location.replace("/p181/");
    }
  }, []);

  return (
    <Router basename="/p181">
      <AppNavbar />
      <Container fluid className="app-container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/myteams"
            element={
              <ProtectedRoute>
                <MyTeams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/highlights"
            element={
              <ProtectedRoute>
                <Highlights />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/about"
            element={
              <ProtectedRoute>
                <AboutMe />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Container>
    </Router>
  );
}
export default App;