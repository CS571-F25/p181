import { Card, ListGroup } from "react-bootstrap";
import GameCard from "./GameCard";
import { useSelectedTeams } from "../contexts/SelectedTeamsContext";
import { TEAMS } from "../sports";

export default function ScheduleCard({ games, league, title = "Upcoming Games" }) {
  const { selectedTeams } = useSelectedTeams();
  if (!games || !Array.isArray(games) || games.length === 0) {
    return (
      <Card>
        <Card.Body>
          <Card.Title as="h2">{title}</Card.Title>
          <p className="text-muted">No games scheduled at this time.</p>
        </Card.Body>
      </Card>
    );
  }

  // Filter out invalid games and ensure they match the league structure
  const isValidGameForLeague = (game) => {
    if (!game || typeof game !== 'object') return false;
    
    // Validate game structure matches expected league format
    // All leagues now use TheSportsDB structure: strHomeTeam, strAwayTeam
    switch (league) {
      case "NBA":
      case "NFL":
      case "MLB":
      case "NHL":
        // TheSportsDB structure: strHomeTeam, strAwayTeam, intHomeScore, intAwayScore
        return !!(game.strHomeTeam && game.strAwayTeam);
      default:
        return true;
    }
  };

  const validGames = games.filter(isValidGameForLeague);

  if (validGames.length === 0) {
    return (
      <Card>
        <Card.Body>
          <Card.Title as="h2">{title}</Card.Title>
          <p className="text-muted">No valid games found.</p>
        </Card.Body>
      </Card>
    );
  }

  // Get favorited teams in this league for highlighting
  const teamsInLeague = selectedTeams.filter(teamKey => {
    const [, leagueName] = teamKey.split("-");
    return leagueName === league;
  });

  const favoriteTeamInfo = teamsInLeague.map(teamKey => {
    const [teamAbbr, leagueName] = teamKey.split("-");
    const teamData = TEAMS[leagueName]?.find(t => t.abbreviation === teamAbbr);
    return {
      abbreviation: teamAbbr,
      name: teamData?.name || teamAbbr,
      fullName: teamData?.name || teamAbbr
    };
  });

  // Separate favorite games and other games, then prioritize favorites
  const favoriteGames = [];
  const otherGames = [];

  validGames.forEach(game => {
    let isFavoriteGame = false;

    if (league === "NFL") {
      const homeTeam = game.strHomeTeam;
      const awayTeam = game.strAwayTeam;
      isFavoriteGame = favoriteTeamInfo.some(team => 
        team.name === homeTeam || team.fullName === homeTeam ||
        team.name === awayTeam || team.fullName === awayTeam
      );
    } else if (league === "NBA") {
      // TheSportsDB structure: strHomeTeam, strAwayTeam
      const homeName = game.strHomeTeam;
      const awayName = game.strAwayTeam;
      isFavoriteGame = favoriteTeamInfo.some(team => 
        team.name === homeName || team.fullName === homeName ||
        team.name === awayName || team.fullName === awayName
      );
    } else if (league === "MLB") {
      // TheSportsDB structure: strHomeTeam, strAwayTeam
      const homeName = game.strHomeTeam;
      const awayName = game.strAwayTeam;
      isFavoriteGame = favoriteTeamInfo.some(team => 
        team.name === homeName || team.fullName === homeName ||
        team.name === awayName || team.fullName === awayName
      );
    } else if (league === "NHL") {
      // TheSportsDB structure: strHomeTeam, strAwayTeam
      const homeName = game.strHomeTeam;
      const awayName = game.strAwayTeam;
      isFavoriteGame = favoriteTeamInfo.some(team => 
        team.name === homeName || team.fullName === homeName ||
        team.name === awayName || team.fullName === awayName
      );
    }

    if (isFavoriteGame) {
      favoriteGames.push(game);
    } else {
      otherGames.push(game);
    }
  });

  // Prioritize favorite games - show them first
  const prioritizedGames = [...favoriteGames, ...otherGames].slice(0, 20);

  return (
    <Card>
      <Card.Body>
        <Card.Title as="h2">{title}</Card.Title>
        <ListGroup variant="flush">
          {prioritizedGames.map((game, index) => {
            const gameKey = game.idEvent || game.id || game.game?.id || game.gamePk || `game-${index}`;
            const isFavorite = favoriteGames.includes(game);
            
            return (
              <ListGroup.Item 
                key={gameKey} 
                className="px-0"
                style={isFavorite ? {
                  borderLeft: "4px solid #48bb78",
                  backgroundColor: "rgba(72, 187, 120, 0.05)",
                  marginBottom: "0.5rem"
                } : {}}
              >
                <GameCard game={game} league={league} />
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </Card.Body>
    </Card>
  );
}

