import { Navbar, Nav, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useSelectedTeams } from "../contexts/SelectedTeamsContext";
import { loadTeamLogosFromGitHub } from "../services/teamLogosService";
import { useState, useEffect } from "react";
import { TEAMS } from "../sports";

function AppNavbar() {
  const { selectedTeams } = useSelectedTeams();
  const [teamLogos, setTeamLogos] = useState({});

  useEffect(() => {
    const loadLogos = async () => {
      const logos = await loadTeamLogosFromGitHub();
      setTeamLogos(logos || {});
    };
    loadLogos();
  }, []);

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
          <Nav className="align-items-center">
            {/* Favorite Team Logos */}
            {selectedTeams.length > 0 && (
              <div className="d-flex align-items-center me-3" style={{ gap: "0.5rem" }}>
                {selectedTeams.slice(0, 5).map((teamKey) => {
                  const [teamAbbr, league] = teamKey.split("-");
                  const teamData = TEAMS[league]?.find(t => t.abbreviation === teamAbbr);
                  
                  return (
                    <div
                      key={teamKey}
                      style={{
                        width: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "8px",
                        overflow: "hidden"
                      }}
                      title={teamData?.name || teamAbbr}
                    >
                      {teamLogos[teamKey] ? (
                        <img
                          src={teamLogos[teamKey]}
                          alt={`${teamData?.name || teamAbbr} logo`}
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.7rem",
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            color: "white"
                          }}
                        >
                          {teamAbbr}
                        </div>
                      )}
                    </div>
                  );
                })}
                {selectedTeams.length > 5 && (
                  <span className="text-light" style={{ fontSize: "0.8rem" }}>
                    +{selectedTeams.length - 5}
                  </span>
                )}
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
export default AppNavbar;