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
    switch (league) {
      case "NBA":
        // NBA games must have home_team and visitor_team
        return !!(game.home_team && game.visitor_team);
      case "NFL":
        // TheSportsDB structure: strHomeTeam, strAwayTeam, intHomeScore, intAwayScore
        return !!(game.strHomeTeam && game.strAwayTeam);
      case "MLB":
        // API-Sports structure: game has nested game.game, game.teams, game.scores
        // Check for either the nested structure or flat structure
        return !!(game.teams?.home && game.teams?.away) || !!(game.game && game.teams);
      case "NHL":
        // NHL games must have teams.home.team and teams.away.team
        return !!(game.teams?.home?.team && game.teams?.away?.team);
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
      const homeName = game.home_team?.full_name || game.home_team?.name;
      const visitorName = game.visitor_team?.full_name || game.visitor_team?.name;
      isFavoriteGame = favoriteTeamInfo.some(team => 
        team.name === homeName || team.fullName === homeName ||
        team.name === visitorName || team.fullName === visitorName
      );
    } else if (league === "MLB") {
      const homeName = game.teams?.home?.name;
      const awayName = game.teams?.away?.name;
      isFavoriteGame = favoriteTeamInfo.some(team => 
        team.name === homeName || team.fullName === homeName ||
        team.name === awayName || team.fullName === awayName
      );
    } else if (league === "NHL") {
      const homeName = game.teams?.home?.team?.name;
      const awayName = game.teams?.away?.team?.name;
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
  const prioritizedGames = [...favoriteGames, ...otherGames].slice(0, league === "NFL" ? 20 : 5);

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

