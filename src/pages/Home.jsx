import { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link, useSearchParams } from "react-router-dom";
import StatsWidget from "../components/StatsWidget";
import LeagueSelector from "../components/LeagueSelector";
import HighlightList from "../components/HighlightList";
import { useSelectedTeams } from "../contexts/SelectedTeamsContext";
import { fetchHighlights, fetchGamesByLeague } from "../services/sportsApi";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { LEAGUES, TEAMS } from "../sports";

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [league, setLeague] = useState(() => {
    // Check URL params for league filter
    const leagueParam = searchParams.get('league');
    return leagueParam || "";
  });
  const [highlights, setHighlights] = useState([]);
  const [otherHighlights, setOtherHighlights] = useState([]); // For "Other Teams" section
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { selectedTeams } = useSelectedTeams();

  // Load highlights based on selected league - fetch once per league (5 highlights)
  useEffect(() => {
    let isMounted = true;

    const loadHighlights = async () => {
      try {
        setLoading(true);
        setError(null);
        setOtherHighlights([]);

        if (league === "") {
          // All leagues - fetch highlights from all leagues (5 per league)
          try {
            const allLeaguePromises = LEAGUES.map(async (leagueName) => {
              try {
                return await fetchHighlights(leagueName, null, 5);
              } catch (err) {
                console.error(`Error fetching highlights for ${leagueName}:`, err);
                return [];
              }
            });
            const allResults = await Promise.all(allLeaguePromises);
            const allHighlights = allResults.flat().filter(Boolean);
            
            if (isMounted) {
              // If user has favorite teams, prioritize their highlights
              if (selectedTeams.length > 0) {
                const favoriteTeamInfo = selectedTeams.map(teamKey => {
                  const [teamAbbr, leagueName] = teamKey.split("-");
                  const teamData = TEAMS[leagueName]?.find(t => t.abbreviation === teamAbbr);
                  return {
                    abbreviation: teamAbbr,
                    name: teamData?.name || teamAbbr,
                    league: leagueName
                  };
                });

                const favoriteHighlights = [];
                const otherHighlightsList = [];

                allHighlights.forEach(highlight => {
                  const isFavorite = favoriteTeamInfo.some(team => {
                    const homeTeam = highlight.strHomeTeam || "";
                    const awayTeam = highlight.strAwayTeam || "";
                    const highlightLeague = highlight.strLeague || "";
                    return team.league === highlightLeague && 
                           (homeTeam.includes(team.name) || awayTeam.includes(team.name) ||
                            homeTeam.includes(team.abbreviation) || awayTeam.includes(team.abbreviation));
                  });

                  if (isFavorite) {
                    favoriteHighlights.push(highlight);
                  } else {
                    otherHighlightsList.push(highlight);
                  }
                });

                setHighlights(favoriteHighlights);
                setOtherHighlights(otherHighlightsList);
              } else {
                setHighlights(allHighlights);
                setOtherHighlights([]);
              }
            }
          } catch (err) {
            console.error(`Error fetching highlights:`, err);
            if (isMounted) {
              setHighlights([]);
              setOtherHighlights([]);
            }
          }
        } else {
          // Specific league - fetch 5 highlights for that league
          try {
            const leagueHighlights = await fetchHighlights(league, null, 5);
            
            if (isMounted) {
              // If user has favorite teams in this league, prioritize their highlights
              const teamsInLeague = selectedTeams.filter(teamKey => {
                const [, leagueName] = teamKey.split("-");
                return leagueName === league;
              });

              if (teamsInLeague.length > 0) {
                const favoriteTeamInfo = teamsInLeague.map(teamKey => {
                  const [teamAbbr, leagueName] = teamKey.split("-");
                  const teamData = TEAMS[leagueName]?.find(t => t.abbreviation === teamAbbr);
                  return {
                    abbreviation: teamAbbr,
                    name: teamData?.name || teamAbbr
                  };
                });

                const favoriteHighlights = [];
                const otherHighlightsList = [];

                leagueHighlights.forEach(highlight => {
                  const homeTeam = highlight.strHomeTeam || "";
                  const awayTeam = highlight.strAwayTeam || "";
                  const isFavorite = favoriteTeamInfo.some(team => 
                    homeTeam.includes(team.name) || awayTeam.includes(team.name) ||
                    homeTeam.includes(team.abbreviation) || awayTeam.includes(team.abbreviation)
                  );

                  if (isFavorite) {
                    favoriteHighlights.push(highlight);
                  } else {
                    otherHighlightsList.push(highlight);
                  }
                });

                setHighlights(favoriteHighlights);
                setOtherHighlights(otherHighlightsList);
              } else {
                setHighlights(leagueHighlights);
                setOtherHighlights([]);
              }
            }
          } catch (err) {
            console.error(`Error fetching highlights for ${league}:`, err);
            if (isMounted) {
              setHighlights([]);
              setOtherHighlights([]);
            }
          }
        }
      } catch (err) {
        console.error("Error in loadHighlights:", err);
        if (isMounted) {
          setError("Failed to load highlights");
          setHighlights([]);
          setOtherHighlights([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadHighlights();

    return () => {
      isMounted = false;
    };
  }, [selectedTeams, league]);

  // Load games when league is selected - prioritize favorited teams if available
  useEffect(() => {
    let isMounted = true;
    
    if (!league) {
      setGames([]);
      return;
    }

    const loadGames = async () => {
      try {
        // Fetch all games for the league
        const allGames = await fetchGamesByLeague(league);
        
        // Get favorited teams in the selected league
        const teamsInLeague = selectedTeams.filter(teamKey => {
          const [, leagueName] = teamKey.split("-");
          return leagueName === league;
        });

        if (teamsInLeague.length > 0) {
          // Get team names and abbreviations for favorited teams
          const favoriteTeamInfo = teamsInLeague.map(teamKey => {
            const [teamAbbr, leagueName] = teamKey.split("-");
            const teamData = TEAMS[leagueName]?.find(t => t.abbreviation === teamAbbr);
            return {
              abbreviation: teamAbbr,
              name: teamData?.name || teamAbbr,
              fullName: teamData?.name || teamAbbr
            };
          });
          
          // Separate games into favorite team games and other games
          const favoriteGames = [];
          const otherGames = [];
          
          allGames.forEach(game => {
            let isFavoriteGame = false;
            
            if (league === "NBA") {
              // TheSportsDB structure: strHomeTeam, strAwayTeam
              const homeName = game.strHomeTeam;
              const awayName = game.strAwayTeam;
              
              isFavoriteGame = favoriteTeamInfo.some(team => 
                team.name === homeName ||
                team.fullName === homeName ||
                team.name === awayName ||
                team.fullName === awayName
              );
            } else if (league === "NFL") {
              const homeName = game.strHomeTeam;
              const awayName = game.strAwayTeam;
              
              isFavoriteGame = favoriteTeamInfo.some(team => 
                team.name === homeName ||
                team.fullName === homeName ||
                team.name === awayName ||
                team.fullName === awayName
              );
            } else if (league === "MLB") {
              // TheSportsDB structure: strHomeTeam, strAwayTeam
              const homeName = game.strHomeTeam;
              const awayName = game.strAwayTeam;
              
              isFavoriteGame = favoriteTeamInfo.some(team => 
                team.name === homeName ||
                team.fullName === homeName ||
                team.name === awayName ||
                team.fullName === awayName
              );
            } else if (league === "NHL") {
              // TheSportsDB structure: strHomeTeam, strAwayTeam
              const homeName = game.strHomeTeam;
              const awayName = game.strAwayTeam;
              
              isFavoriteGame = favoriteTeamInfo.some(team => 
                team.name === homeName ||
                team.fullName === homeName ||
                team.name === awayName ||
                team.fullName === awayName
              );
            }
            
            if (isFavoriteGame) {
              favoriteGames.push(game);
            } else {
              otherGames.push(game);
            }
          });
          
          // Prioritize favorite games - show them first
          if (isMounted) {
            setGames([...favoriteGames, ...otherGames]);
          }
        } else {
          // No favorited teams in this league, show all games
          if (isMounted) {
            setGames(allGames);
          }
        }
      } catch (err) {
        console.error("Failed to load games:", err);
        if (isMounted) {
          setGames([]);
        }
      }
    };

    loadGames();
    
    return () => {
      isMounted = false;
    };
  }, [league, selectedTeams]);

  return (
    <Container fluid>
      <h1>Welcome to Sports Tracker</h1>
      <p className="lead">Stay up to date with your favorite teams and their highlights</p>
      
      <Row className="mb-4">
        <Col md={6}>
      <div className="mb-3">
            <label htmlFor="league-selector" className="form-label">
              Filter by League
            </label>
            <LeagueSelector 
              selectedLeague={league} 
              setSelectedLeague={(newLeague) => {
                setLeague(newLeague);
                // Update URL params
                if (newLeague) {
                  setSearchParams({ league: newLeague });
                } else {
                  setSearchParams({});
                }
              }}
              id="league-selector"
              includeAll={true}
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

      {/* Layout: Full width when "All leagues", side-by-side when specific league selected */}
      {league === "" ? (
        // All leagues selected - full width highlights, no games
        <div className="mb-4">
          <h2>
            {selectedTeams.length > 0 
              ? "Your Favorite Teams Highlights"
              : "Featured Highlights"
            }
          </h2>
          {loading ? (
            <LoadingSpinner message="Loading highlights..." />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : highlights.length > 0 ? (
            <>
              <HighlightList highlights={highlights} league={league} fullSize={true} />
              {otherHighlights.length > 0 && (
                <div className="mt-4">
                  <h3>Other Teams</h3>
                  <HighlightList highlights={otherHighlights} league={league} fullSize={true} />
                </div>
              )}
            </>
          ) : otherHighlights.length > 0 ? (
            <>
              <p className="text-muted mb-3">No highlights available for your favorite teams.</p>
              <h3>Other Teams</h3>
              <HighlightList highlights={otherHighlights} league={league} fullSize={true} />
            </>
          ) : (
            <p className="text-muted">No highlights available at this time.</p>
          )}
        </div>
      ) : (
        // Specific league selected - side by side layout
        <Row>
          {/* Left Column: Highlights */}
          <Col md={6}>
            <div className="mb-4">
              <h2>
                {selectedTeams.length > 0 
                  ? `${league} Highlights`
                  : `${league} Highlights`
                }
              </h2>
              {loading ? (
                <LoadingSpinner message="Loading highlights..." />
              ) : error ? (
                <ErrorMessage message={error} />
              ) : highlights.length > 0 ? (
                <>
                  <HighlightList highlights={highlights} league={league} fullSize={false} />
                  {otherHighlights.length > 0 && (
                    <div className="mt-4">
                      <h3>Other Teams</h3>
                      <HighlightList highlights={otherHighlights} league={league} fullSize={false} />
                    </div>
                  )}
                </>
              ) : otherHighlights.length > 0 ? (
                <>
                  <p className="text-muted mb-3">No highlights available for your favorite teams.</p>
                  <h3>Other Teams</h3>
                  <HighlightList highlights={otherHighlights} league={league} fullSize={false} />
                </>
              ) : (
                <p className="text-muted">No highlights available at this time.</p>
              )}
            </div>
          </Col>

          {/* Right Column: Games */}
          <Col md={6}>
            <div className="mb-4">
              <StatsWidget team="" league={league} />
    </div>
          </Col>
        </Row>
      )}
    </Container>
  );
}
