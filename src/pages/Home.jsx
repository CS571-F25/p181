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

  // Load highlights based on selected teams or random
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates if component unmounts

    const loadHighlights = async () => {
      try {
        setLoading(true);
        setError(null);
        setOtherHighlights([]); // Reset other highlights

        if (selectedTeams.length > 0) {
          // User has selected teams
          if (league === "") {
            // All leagues - prioritize favorited teams' highlights first, then show all
            try {
              // First, get highlights for favorited teams from all leagues
              const favoriteHighlightPromises = selectedTeams.map(async (teamKey) => {
                try {
                  const [teamAbbr, leagueName] = teamKey.split("-");
                  if (!leagueName || !teamAbbr) return [];
                  
                  const teamData = TEAMS[leagueName]?.find(t => t.abbreviation === teamAbbr);
                  const teamName = teamData?.name || teamAbbr;
                  
                  let highlights = await fetchHighlights(leagueName, teamName);
                  if (!highlights || highlights.length === 0) {
                    highlights = await fetchHighlights(leagueName, teamAbbr);
                  }
                  
                  return highlights || [];
                } catch (err) {
                  console.error(`Error fetching highlights for ${teamKey}:`, err);
                  return [];
                }
              });
              
              // Also get highlights from all leagues
              const allLeaguePromises = LEAGUES.map(async (leagueName) => {
                try {
                  return await fetchHighlights(leagueName);
                } catch (err) {
                  console.error(`Error fetching highlights for ${leagueName}:`, err);
                  return [];
                }
              });
              
              const [favoriteResults, allResults] = await Promise.all([
                Promise.all(favoriteHighlightPromises),
                Promise.all(allLeaguePromises)
              ]);
              
              const favoriteHighlights = favoriteResults.flat().filter(Boolean);
              const allHighlights = allResults.flat().filter(Boolean);
              
              // Remove duplicates and prioritize favorites
              const favoriteIds = new Set(favoriteHighlights.map(h => h.idEvent || h.id));
              const otherHighlights = allHighlights.filter(h => !favoriteIds.has(h.idEvent || h.id));
              
              if (isMounted) {
                setHighlights(favoriteHighlights.length > 0 ? favoriteHighlights : allHighlights);
                setOtherHighlights(favoriteHighlights.length > 0 ? otherHighlights : []);
              }
            } catch (err) {
              console.error(`Error fetching all highlights:`, err);
              if (isMounted) {
                setHighlights([]);
                setOtherHighlights([]);
              }
            }
          } else {
            // Specific league - filter selected teams by league
            const teamsInLeague = selectedTeams.filter(teamKey => {
              const [, leagueName] = teamKey.split("-");
              return leagueName === league;
            });
            
            if (teamsInLeague.length > 0) {
              // Fetch highlights for favorited teams - try both abbreviation and full name
              const highlightPromises = teamsInLeague.map(async (teamKey) => {
                try {
                  const [teamAbbr, leagueName] = teamKey.split("-");
                  if (!leagueName || !teamAbbr) return [];
                  
                  // Get team full name from TEAMS data
                  const teamData = TEAMS[leagueName]?.find(t => t.abbreviation === teamAbbr);
                  const teamName = teamData?.name || teamAbbr;
                  
                  // Try fetching with team name first, then abbreviation
                  let highlights = await fetchHighlights(leagueName, teamName);
                  if (!highlights || highlights.length === 0) {
                    highlights = await fetchHighlights(leagueName, teamAbbr);
                  }
                  
                  return highlights || [];
                } catch (err) {
                  console.error(`Error fetching highlights for ${teamKey}:`, err);
                  return [];
                }
              });
              const results = await Promise.all(highlightPromises);
              const favoriteHighlights = results.flat().filter(Boolean);
              
              if (isMounted) {
                setHighlights(favoriteHighlights);
                
                // If no highlights for favorited teams, show random highlights from league
                if (favoriteHighlights.length === 0) {
                  try {
                    const randomHighlights = await fetchHighlights(league);
                    if (isMounted) {
                      setOtherHighlights(randomHighlights || []);
                    }
                  } catch (err) {
                    console.error(`Error fetching random highlights for ${league}:`, err);
                    if (isMounted) {
                      setOtherHighlights([]);
                    }
                  }
                } else {
                  setOtherHighlights([]);
                }
              }
            } else {
              // No teams in selected league - show random highlights from that league
              try {
                const randomHighlights = await fetchHighlights(league);
                if (isMounted) {
                  setHighlights(randomHighlights || []);
                  setOtherHighlights([]);
                }
              } catch (err) {
                console.error(`Error fetching random highlights for ${league}:`, err);
                if (isMounted) {
                  setHighlights([]);
                  setOtherHighlights([]);
                }
              }
            }
          }
        } else {
          // No selected teams - show highlights
          if (league === "") {
            // All leagues - fetch highlights from ALL leagues
            try {
              const allLeaguePromises = LEAGUES.map(async (leagueName) => {
                try {
                  return await fetchHighlights(leagueName);
                } catch (err) {
                  console.error(`Error fetching highlights for ${leagueName}:`, err);
                  return [];
                }
              });
              const allResults = await Promise.all(allLeaguePromises);
              const allHighlights = allResults.flat().filter(Boolean);
              if (isMounted) {
                setHighlights(allHighlights || []);
                setOtherHighlights([]);
              }
            } catch (err) {
              console.error(`Error fetching highlights:`, err);
              if (isMounted) {
                setHighlights([]);
                setOtherHighlights([]);
              }
            }
          } else {
            // Random from selected league
            try {
              const randomHighlights = await fetchHighlights(league);
              if (isMounted) {
                setHighlights(randomHighlights || []);
                setOtherHighlights([]);
              }
            } catch (err) {
              console.error(`Error fetching highlights for ${league}:`, err);
              if (isMounted) {
                setHighlights([]);
                setOtherHighlights([]);
              }
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

    // Cleanup function
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
        ) : otherHighlights.length > 0 ? (
          <>
            <p className="text-muted mb-3">No highlights available for your favorite teams.</p>
            <h3>Other Teams</h3>
            <HighlightList highlights={otherHighlights} league={league} />
          </>
        ) : (
          <p className="text-muted">No highlights available at this time.</p>
        )}
        
        {/* Show "Other Teams" section if we have both favorite highlights and other highlights */}
        {highlights.length > 0 && otherHighlights.length > 0 && (
          <div className="mt-4">
            <h3>Other Teams</h3>
            <HighlightList highlights={otherHighlights} league={league} />
          </div>
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
