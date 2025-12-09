import { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import StatsWidget from "../components/StatsWidget";
import LeagueSelector from "../components/LeagueSelector";
import HighlightList from "../components/HighlightList";
import { useSelectedTeams } from "../contexts/SelectedTeamsContext";
import { fetchHighlights, fetchGamesByLeague } from "../services/sportsApi";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { LEAGUES } from "../sports";

export default function Home() {
  const [league, setLeague] = useState("");
  const [highlights, setHighlights] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { selectedTeams } = useSelectedTeams();

  // Load highlights based on selected teams or random
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates if component unmounts

    const loadHighlights = async () => {
      try {
        setLoading(true);
        setError(null);

        if (selectedTeams.length > 0) {
          // User has selected teams - show highlights for selected league
          if (league === "") {
            // All leagues - get highlights for all selected teams
            const highlightPromises = selectedTeams.map(async (teamKey) => {
              try {
                const [teamAbbr, leagueName] = teamKey.split("-");
                if (!leagueName || !teamAbbr) return [];
                return await fetchHighlights(leagueName, teamAbbr);
              } catch (err) {
                console.error(`Error fetching highlights for ${teamKey}:`, err);
                return [];
              }
            });
            const results = await Promise.all(highlightPromises);
            const allHighlights = results.flat().filter(Boolean);
            if (isMounted) {
              setHighlights(allHighlights);
            }
          } else {
            // Specific league - filter selected teams by league
            const teamsInLeague = selectedTeams.filter(teamKey => {
              const [, leagueName] = teamKey.split("-");
              return leagueName === league;
            });
            
            if (teamsInLeague.length > 0) {
              const highlightPromises = teamsInLeague.map(async (teamKey) => {
                try {
                  const [teamAbbr, leagueName] = teamKey.split("-");
                  if (!leagueName || !teamAbbr) return [];
                  return await fetchHighlights(leagueName, teamAbbr);
                } catch (err) {
                  console.error(`Error fetching highlights for ${teamKey}:`, err);
                  return [];
                }
              });
              const results = await Promise.all(highlightPromises);
              const allHighlights = results.flat().filter(Boolean);
              if (isMounted) {
                setHighlights(allHighlights);
              }
            } else {
              // No teams in selected league - show random highlights from that league
              try {
                const randomHighlights = await fetchHighlights(league);
                if (isMounted) {
                  setHighlights(randomHighlights || []);
                }
              } catch (err) {
                console.error(`Error fetching random highlights for ${league}:`, err);
                if (isMounted) {
                  setHighlights([]);
                }
              }
            }
          }
        } else {
          // No selected teams - show random highlights
          if (league === "") {
            // Random from all leagues
            const randomLeague = LEAGUES[Math.floor(Math.random() * LEAGUES.length)];
            try {
              const randomHighlights = await fetchHighlights(randomLeague);
              if (isMounted) {
                setHighlights(randomHighlights || []);
              }
            } catch (err) {
              console.error(`Error fetching random highlights:`, err);
              if (isMounted) {
                setHighlights([]);
              }
            }
          } else {
            // Random from selected league
            try {
              const randomHighlights = await fetchHighlights(league);
              if (isMounted) {
                setHighlights(randomHighlights || []);
              }
            } catch (err) {
              console.error(`Error fetching highlights for ${league}:`, err);
              if (isMounted) {
                setHighlights([]);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error in loadHighlights:", err);
        if (isMounted) {
          setError("Failed to load highlights");
          setHighlights([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadHighlights();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [selectedTeams, league]);

  // Load games when league is selected
  useEffect(() => {
    if (!league) {
      setGames([]);
      return;
    }

    const loadGames = async () => {
      try {
        const fetchedGames = await fetchGamesByLeague(league);
        setGames(fetchedGames);
      } catch (err) {
        console.error("Failed to load games:", err);
      }
    };

    loadGames();
  }, [league]);

  return (
    <Container fluid>
      <h1>Welcome to Sports Tracker</h1>
      <p className="lead">Stay up to date with your favorite teams and their highlights</p>
      
      <Row className="mb-4">
        <Col md={6}>
          <div className="mb-3">
            <label htmlFor="league-selector" className="form-label">
              {selectedTeams.length > 0 ? "Filter by League" : "Select a League"}
            </label>
            <LeagueSelector 
              selectedLeague={league} 
              setSelectedLeague={setLeague}
              id="league-selector"
              includeAll={selectedTeams.length > 0}
            />
          </div>
        </Col>
      </Row>

      {selectedTeams.length === 0 && (
        <div className="mb-4">
          <p className="text-muted">
            Visit the <Link to="/myteams">My Teams</Link> page to select your favorite teams and see personalized highlights here!
          </p>
        </div>
      )}

      <div className="mb-4">
        <h2>
          {selectedTeams.length > 0 
            ? (league === "" ? "Your Favorite Teams Highlights" : `${league} Highlights`)
            : (league === "" ? "Featured Highlights" : `${league} Highlights`)
          }
        </h2>
        {loading ? (
          <LoadingSpinner message="Loading highlights..." />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : highlights.length > 0 ? (
          <HighlightList highlights={highlights} league={league} />
        ) : (
          <p className="text-muted">No highlights available at this time.</p>
        )}
      </div>

      {league && (
        <div className="mb-4">
          <StatsWidget team="" league={league} />
        </div>
      )}
    </Container>
  );
}
