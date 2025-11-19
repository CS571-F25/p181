import { Card, Button } from "react-bootstrap";

export default function HighlightCard({ title, description, videoUrl }) {
  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Text>{description}</Card.Text>
        <Button variant="primary" href={videoUrl} target="_blank">
          Watch Highlight
        </Button>
      </Card.Body>
    </Card>
  );
}
