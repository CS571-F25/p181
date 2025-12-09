import { Container, Card } from "react-bootstrap";

export default function AboutMe() {
  return (
    <Container fluid>
      <h1>About This Project</h1>
      
      <Card className="mb-4">
        <Card.Body>
          <Card.Title as="h2">Sports Highlight Tracker</Card.Title>
          <Card.Text>
            The Sports Highlight Tracker is a website designed for sports fans that want a personalized way to stay up to date on their favorite teams. 
            Instead of scrolling endlessly on social media or news apps, users can access a clean, organized hub that combines highlight videos, 
            game summaries, and top plays from recent NBA, NFL, MLB, or NHL games.
          </Card.Text>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Body>
          <Card.Title as="h2">Key Features</Card.Title>
          <ul>
            <li>Select and save your favorite teams from NBA, NFL, MLB, and NHL</li>
            <li>View personalized highlights on your homepage based on your team selections</li>
            <li>Browse highlights from all leagues</li>
            <li>Favorite highlights for easy access later</li>
            <li>Engage with other fans through comments</li>
            <li>View upcoming games and schedules</li>
          </ul>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Card.Title as="h2">How to Use</Card.Title>
          <ol>
            <li>Visit the <strong>My Teams</strong> page to select your favorite teams</li>
            <li>Return to the <strong>Home</strong> page to see personalized highlights</li>
            <li>Browse the <strong>Highlights</strong> page to see all available highlights</li>
            <li>Click the heart icon to favorite highlights you want to save</li>
            <li>Add comments to share your thoughts with other fans</li>
          </ol>
        </Card.Body>
      </Card>
    </Container>
  );
}
