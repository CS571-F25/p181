import { Card, Badge } from "react-bootstrap";

export default function GameCard({ game, league }) {
  // Validate inputs
  if (!game || !league) {
    return null;
  }

  // Validate that the game structure matches the expected league format
  const isValidForLeague = () => {
    switch (league) {
      case "NBA":
        // NBA games should have home_team and visitor_team (not teams.home/teams.away)
        return !!(game.home_team && game.visitor_team);
      case "NFL":
      case "MLB":
        // API-Sports structure: game has nested game.game, game.teams, game.scores
        // Check for either the nested structure or flat structure
        return !!(game.teams?.home && game.teams?.away) || !!(game.game && game.teams);
      case "NHL":
        // NHL games should have teams.home.team and teams.away.team
        return !!(game.teams?.home?.team && game.teams?.away?.team);
      default:
        return true;
    }
  };

  if (!isValidForLeague()) {
    return null; // Don't render games that don't match the league structure
  }
  const formatDate = (dateString) => {
    if (!dateString) return "Date TBD";
    try {
      // Handle different date formats
      let date;
      if (typeof dateString === "string") {
        // Try parsing as ISO string first
        date = new Date(dateString);
        // If that fails, try other common formats
        if (isNaN(date.getTime())) {
          // Try parsing as timestamp
          const timestamp = parseInt(dateString);
          if (!isNaN(timestamp)) {
            date = new Date(timestamp * 1000); // If it's seconds, convert to milliseconds
            if (isNaN(date.getTime())) {
              date = new Date(timestamp); // If it's already milliseconds
            }
          }
        }
      } else if (typeof dateString === "number") {
        // Handle timestamp (could be seconds or milliseconds)
        date = dateString > 10000000000 
          ? new Date(dateString) // milliseconds
          : new Date(dateString * 1000); // seconds
      } else if (typeof dateString === "object" && dateString.date) {
        // Handle API-Sports date object: { date: "2023-08-18", time: "23:30", timestamp: 1692401400 }
        date = new Date(dateString.date + (dateString.time ? "T" + dateString.time : ""));
        if (isNaN(date.getTime()) && dateString.timestamp) {
          date = new Date(dateString.timestamp * (dateString.timestamp.toString().length === 10 ? 1000 : 1));
        }
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        return "Date TBD";
      }
      
      return date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      });
    } catch (err) {
      console.error("Error formatting date:", err, dateString);
      return "Date TBD";
    }
  };

  // Helper function to extract status string
  const getStatusString = (status) => {
    if (!status) return "Scheduled";
    if (typeof status === "string") return status;
    if (typeof status === "object") {
      return status.long || status.short || status.abstractGameState || status.detailedState || "Scheduled";
    }
    return "Scheduled";
  };

  const getGameInfo = () => {
    switch (league) {
      case "NBA":
        // Ball Don't Lie API: date is YYYY-MM-DD, datetime is ISO format
        // Prefer datetime for display, fall back to date
        const gameDate = game.datetime || game.date || game.game_date || game.scheduled;
        return {
          homeTeam: game.home_team?.full_name || game.home_team?.name || "Home Team",
          awayTeam: game.visitor_team?.full_name || game.visitor_team?.name || "Away Team",
          homeScore: game.home_team_score,
          awayScore: game.visitor_team_score,
          status: getStatusString(game.status),
          date: gameDate,
        };
      case "NFL":
        // TheSportsDB structure: strHomeTeam, strAwayTeam, intHomeScore, intAwayScore, dateEventLocal, strTimeLocal
        const nflDate = game.dateEventLocal 
          ? `${game.dateEventLocal}${game.strTimeLocal ? 'T' + game.strTimeLocal : ''}`
          : (game.dateEvent || game.strTimestamp || game.date);
        
        return {
          homeTeam: game.strHomeTeam || "Home Team",
          awayTeam: game.strAwayTeam || "Away Team",
          homeScore: game.intHomeScore !== null && game.intHomeScore !== "" ? parseInt(game.intHomeScore) : null,
          awayScore: game.intAwayScore !== null && game.intAwayScore !== "" ? parseInt(game.intAwayScore) : null,
          status: getStatusString(game.strStatus || "Final"),
          date: nflDate,
        };
      case "MLB":
        // API-Sports structure: game.game.date, game.status, game.teams, game.scores
        // scores might be objects or numbers
        const mlbDate = game.game?.date?.date || game.game?.date?.timestamp || game.date;
        const mlbHomeScoreObj = game.scores?.home;
        const mlbAwayScoreObj = game.scores?.away;
        const mlbHomeScore = typeof mlbHomeScoreObj === 'object' && mlbHomeScoreObj !== null
          ? (mlbHomeScoreObj.total ?? mlbHomeScoreObj.runs ?? null)
          : (mlbHomeScoreObj ?? null);
        const mlbAwayScore = typeof mlbAwayScoreObj === 'object' && mlbAwayScoreObj !== null
          ? (mlbAwayScoreObj.total ?? mlbAwayScoreObj.runs ?? null)
          : (mlbAwayScoreObj ?? null);
        
        return {
          homeTeam: game.teams?.home?.name || "Home Team",
          awayTeam: game.teams?.away?.name || "Away Team",
          homeScore: mlbHomeScore,
          awayScore: mlbAwayScore,
          status: getStatusString(game.game?.status || game.status),
          date: mlbDate,
        };
      case "NHL":
        return {
          homeTeam: game.teams?.home?.team?.name || "Home Team",
          awayTeam: game.teams?.away?.team?.name || "Away Team",
          homeScore: game.linescore?.teams?.home?.goals,
          awayScore: game.linescore?.teams?.away?.goals,
          status: getStatusString(game.status),
          date: game.gameDate,
        };
      default:
        return {
          homeTeam: "Home Team",
          awayTeam: "Away Team",
          homeScore: null,
          awayScore: null,
          status: "Scheduled",
          date: new Date().toISOString(),
        };
    }
  };

  const gameInfo = getGameInfo();
  const statusLower = (gameInfo.status || "").toLowerCase();
  const isFinal = statusLower.includes("final") || statusLower.includes("finished") || statusLower.includes("ft") || statusLower.includes("completed");
  const hasScores = (gameInfo.homeScore !== null && gameInfo.homeScore !== undefined) || (gameInfo.awayScore !== null && gameInfo.awayScore !== undefined);
  const isScheduled = gameInfo.status === "Scheduled" || (!isFinal && !hasScores);

  return (
    <Card className="mb-3 game-card" role="article" aria-label={`${gameInfo.awayTeam} at ${gameInfo.homeTeam}`}>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <Card.Title as="h3" style={{ fontSize: "1.1rem", fontWeight: 600 }}>
            {gameInfo.awayTeam} @ {gameInfo.homeTeam}
          </Card.Title>
          <Badge bg={isFinal ? "success" : "secondary"} style={{ borderRadius: "8px", padding: "0.5rem 0.75rem" }}>
            {gameInfo.status}
          </Badge>
        </div>
        
        {(isFinal || hasScores) && (
          <div className="d-flex justify-content-between align-items-center mb-3 game-score-container">
            <div style={{ fontSize: "1.1rem" }}>
              <strong>{gameInfo.awayTeam}</strong>: <span className="game-score">{gameInfo.awayScore ?? "—"}</span>
            </div>
            <div style={{ fontSize: "1.1rem" }}>
              <strong>{gameInfo.homeTeam}</strong>: <span className="game-score">{gameInfo.homeScore ?? "—"}</span>
            </div>
          </div>
        )}
        
        <div className="text-muted" style={{ fontSize: "0.9rem" }}>
          {formatDate(gameInfo.date)}
        </div>
      </Card.Body>
    </Card>
  );
}

