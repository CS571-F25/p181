import { useState, useEffect } from "react";
import { Container, Form, Row, Col } from "react-bootstrap";
import HighlightList from "../components/HighlightList";
import LeagueSelector from "../components/LeagueSelector";
import { fetchHighlights } from "../services/sportsApi";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { LEAGUES } from "../sports";

export default function Highlights() {
  const [selectedLeague, setSelectedLeague] = useState("NBA");
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadHighlights = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedHighlights = await fetchHighlights(selectedLeague);
        setHighlights(fetchedHighlights);
      } catch (err) {
        setError("Failed to load highlights");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadHighlights();
  }, [selectedLeague]);

  return (
    <Container fluid>
      <h1>Latest Highlights</h1>
      <p className="lead">Browse highlights from all leagues</p>

      <div className="mb-4">
        <Form.Group>
          <Form.Label htmlFor="highlights-league-selector">
            Select League to View Highlights
          </Form.Label>
          <LeagueSelector
            selectedLeague={selectedLeague}
            setSelectedLeague={setSelectedLeague}
            id="highlights-league-selector"
          />
        </Form.Group>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading highlights..." />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <HighlightList highlights={highlights} league={selectedLeague} />
      )}
    </Container>
  );
}
