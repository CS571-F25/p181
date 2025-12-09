import { Card, ListGroup } from "react-bootstrap";
import GameCard from "./GameCard";

export default function ScheduleCard({ games, league, title = "Upcoming Games" }) {
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

  // Filter out invalid games
  const validGames = games.filter(game => game && typeof game === 'object');

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

  return (
    <Card>
      <Card.Body>
        <Card.Title as="h2">{title}</Card.Title>
        <ListGroup variant="flush">
          {validGames.slice(0, 5).map((game, index) => {
            const gameKey = game.id || game.gamePk || `game-${index}`;
            return (
              <ListGroup.Item key={gameKey} className="px-0">
                <GameCard game={game} league={league} />
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </Card.Body>
    </Card>
  );
}

