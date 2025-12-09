import { Card, Badge } from "react-bootstrap";

export default function GameCard({ game, league }) {
  // Validate inputs
  if (!game || !league) {
    return null;
  }
  const formatDate = (dateString) => {
    if (!dateString) return "Date TBD";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Date TBD";
      return date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      });
    } catch (err) {
      console.error("Error formatting date:", err);
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
        return {
          homeTeam: game.home_team?.full_name || game.home_team?.name || "Home Team",
          awayTeam: game.visitor_team?.full_name || game.visitor_team?.name || "Away Team",
          homeScore: game.home_team_score,
          awayScore: game.visitor_team_score,
          status: getStatusString(game.status),
          date: game.date,
        };
      case "NFL":
        return {
          homeTeam: game.teams?.home?.name || "Home Team",
          awayTeam: game.teams?.away?.name || "Away Team",
          homeScore: game.scores?.home,
          awayScore: game.scores?.away,
          status: getStatusString(game.status),
          date: game.date,
        };
      case "MLB":
        return {
          homeTeam: game.teams?.home?.name || "Home Team",
          awayTeam: game.teams?.away?.name || "Away Team",
          homeScore: game.scores?.home,
          awayScore: game.scores?.away,
          status: getStatusString(game.status),
          date: game.date,
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
  const isFinal = gameInfo.status === "Final" || gameInfo.status === "Game Over";
  const isScheduled = gameInfo.status === "Scheduled" || !isFinal;

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
        
        {isFinal && (
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

