import React, { useState, useMemo, useEffect } from "react";
import { TEAMS, LEAGUES } from "../sports";
import { Container, Row, Col, Card, Form } from "react-bootstrap";
import { FaCheckCircle, FaSearch } from "react-icons/fa";
import { useSelectedTeams } from "../contexts/SelectedTeamsContext";
import { loadTeamLogosFromGitHub } from "../services/teamLogosService";
import NFLTeamLogo from "../components/NFLTeamLogo";

export default function MyTeams() {
  const { selectedTeams, toggleTeam, isTeamSelected } = useSelectedTeams();
  const [searchQuery, setSearchQuery] = useState("");
  const teamKey = (teamAbbr, league) => `${teamAbbr}-${league}`;
  const [teamLogos, setTeamLogos] = useState({}); // Cache for team logos

  // Load team logos from GitHub database on mount
  useEffect(() => {
    const loadLogos = async () => {
      try {
        const logos = await loadTeamLogosFromGitHub();
        if (logos) {
          setTeamLogos(logos);
        }
      } catch (error) {
        console.error("Error loading team logos:", error);
      }
    };
    
    loadLogos();
  }, []); // Only run once on mount

  // Filter teams based on search query
  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) {
      return TEAMS;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = {};

    LEAGUES.forEach((league) => {
      filtered[league] = TEAMS[league].filter((team) =>
        team.name.toLowerCase().includes(query) ||
        team.abbreviation.toLowerCase().includes(query)
      );
    });

    return filtered;
  }, [searchQuery]);

  return (
    <Container fluid className="my-teams-page">
      <h1>Select your favorite teams below!</h1>
      <p className="lead">Choose teams from any league to personalize your experience</p>
      
      {/* Search Bar */}
      <div className="mb-4">
        <Form.Group>
          <Form.Label htmlFor="team-search" className="visually-hidden">
            Search for teams
          </Form.Label>
          <div style={{ position: "relative", maxWidth: "500px" }}>
            <FaSearch 
              style={{ 
                position: "absolute", 
                left: "1rem", 
                top: "50%", 
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
                pointerEvents: "none"
              }} 
            />
            <Form.Control
              id="team-search"
              type="text"
              placeholder="Search teams by name or abbreviation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: "2.5rem",
                borderRadius: "12px",
                fontSize: "1rem"
              }}
            />
          </div>
        </Form.Group>
      </div>

      {LEAGUES.map((league) => {
        const teamsToShow = filteredTeams[league] || [];
        
        // Don't show league section if no teams match search
        if (teamsToShow.length === 0) {
          return null;
        }

        return (
          <div key={league} className="league-section">
            {/* League Header */}
            <h2 className="mb-4">
              {league}
              {searchQuery && (
                <span className="text-muted" style={{ fontSize: "1rem", fontWeight: "normal" }}>
                  {" "}({teamsToShow.length} {teamsToShow.length === 1 ? "team" : "teams"})
                </span>
              )}
            </h2>

            {/* Teams Grid */}
            <Row className="g-4 mb-5">
              {teamsToShow.map((team) => {
                const key = teamKey(team.abbreviation, league);
                const isSelected = isTeamSelected(key);
                
                return (
                  <Col key={key} xs={6} sm={4} md={3} lg={2}>
                    <Card
                      className={`text-center team-card ${isSelected ? "selected" : ""}`}
                      style={{ cursor: "pointer", padding: "1rem" }}
                      onClick={() => toggleTeam(key)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleTeam(key);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-pressed={isSelected}
                      aria-label={`${isSelected ? "Deselect" : "Select"} ${team.name}`}
                    >
                      {/* Team Logo or Placeholder */}
                      <div 
                        style={{ 
                          height: "100px", 
                          marginBottom: "0.75rem", 
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "12px"
                        }}
                      >
                        {league === "NFL" ? (
                          <NFLTeamLogo teamAbbr={team.abbreviation} size={100} />
                        ) : teamLogos[teamKey(team.abbreviation, league)] ? (
                          <img
                            src={teamLogos[teamKey(team.abbreviation, league)]}
                            alt={`${team.name} logo`}
                            style={{ 
                              height: "100px", 
                              width: "100%",
                              objectFit: "contain",
                              borderRadius: "12px"
                            }}
                            onError={(e) => {
                              // Hide image and show placeholder if it fails to load
                              e.target.style.display = "none";
                              const placeholder = e.target.parentElement.querySelector('.team-placeholder');
                              if (placeholder) {
                                placeholder.style.display = "flex";
                              }
                            }}
                          />
                        ) : (
                          <div 
                            className="team-placeholder"
                            style={{ 
                              height: "100px", 
                              width: "100%",
                              borderRadius: "12px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.875rem",
                              backgroundColor: "var(--border-color)",
                              color: "var(--text-muted)"
                            }}
                            aria-hidden="true"
                          >
                            {team.abbreviation}
                          </div>
                        )}
                      </div>

                      {/* Team Name */}
                      <Card.Body className="p-0">
                        <Card.Title style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                          {team.name}
                        </Card.Title>

                        {/* Checkmark if selected */}
                        {isSelected && (
                          <FaCheckCircle color="#48bb78" size={20} aria-label="Selected" />
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </div>
        );
      })}

      {searchQuery && Object.values(filteredTeams).every(teams => teams.length === 0) && (
        <div className="text-center py-5">
          <p className="text-muted">No teams found matching "{searchQuery}"</p>
        </div>
      )}
    </Container>
  );
}
