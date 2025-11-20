import React, { useState } from "react";
import { TEAMS, LEAGUES } from "../sports";
import { Container, Row, Col, Card, Form } from "react-bootstrap";
import { FaCheckCircle } from "react-icons/fa";
import { useSelectedTeams } from "../contexts/SelectedTeamsContext";


export default function MyTeams() {
    const [selectedTeams, setSelectedTeams] = useState([]);
    const { myTeams, toggleMyTeam } = useSelectedTeams();

  const toggleTeam = (teamAbbr) => {
    if (selectedTeams.includes(teamAbbr)) {
      setSelectedTeams(selectedTeams.filter((t) => t !== teamAbbr));
    } else {
      setSelectedTeams([...selectedTeams, teamAbbr]);
    }
  };

  return (
    <Container fluid style={{ maxHeight: "100vh", overflowY: "auto", padding: "2rem" }}>
        <h1>Select your favorite teams below!</h1>
      {LEAGUES.map((league) => (
        <div key={league} style={{ marginBottom: "3rem" }}>
          {/* League Header */}
          <h2 className="mb-3">{league}</h2>

          {/* Teams Grid */}
          <Row xs={2} sm={3} md={4} lg={6} className="g-3">
            {TEAMS[league].map((team) => (
              <Col key={team.abbreviation + league}>
                <Card
                  className="text-center p-2"
                  style={{ cursor: "pointer" }}
                  onClick={() => toggleTeam(team.abbreviation + league)}
                >
                  {/* Team Image placeholder */}
                  <div style={{ height: "100px", marginBottom: "0.5rem", backgroundColor: "#eee" }}>
                    {/* Replace with <img src={team.image} alt={team.name} /> later */}
                  </div>

                  {/* Team Name */}
                  <Card.Body className="p-1">
                    <Card.Title style={{ fontSize: "0.9rem" }}>{team.name}</Card.Title>

                    {/* Checkmark if selected */}
                    {selectedTeams.includes(team.abbreviation + league) && (
                      <FaCheckCircle color="green" />
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ))}
    </Container>
  );
}
