import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Container } from "react-bootstrap";
import AppNavbar from "./components/Navbar";
import Home from "./pages/Home";
import Highlights from "./pages/Highlights";
import AboutMe from "./pages/AboutMe";
import MyTeams from "./pages/MyTeams";
import Favorites from "./pages/Favorites";

function App() {
  return (
    <Router basename="/p181">
      <AppNavbar />
      <Container fluid className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/myteams" element={<MyTeams />} />
          <Route path="/highlights" element={<Highlights />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/about" element={<AboutMe />} />
        </Routes>
      </Container>
    </Router>
  );
}
export default App;