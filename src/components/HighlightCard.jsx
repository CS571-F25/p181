import { Card, Button } from "react-bootstrap";
import FavoriteButton from "./FavoriteButton";
import CommentSection from "./CommentSection";

export default function HighlightCard({ 
  title, 
  description, 
  videoUrl, 
  highlightId,
  league,
  date,
  thumbnail 
}) {
  const highlightIdValue = highlightId || title?.replace(/\s+/g, "-").toLowerCase() || "highlight";

  return (
    <Card className="mb-3" role="article" aria-label={title}>
      {thumbnail && (
        <Card.Img 
          variant="top" 
          src={thumbnail} 
          alt={`Thumbnail for ${title}`}
          style={{ height: "200px", objectFit: "cover" }}
        />
      )}
      <Card.Body>
        <Card.Title as="h3">{title}</Card.Title>
        {date && (
          <Card.Subtitle className="mb-2 text-muted" style={{ fontSize: "0.9rem" }}>
            {new Date(date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </Card.Subtitle>
        )}
        {description && <Card.Text>Highlight</Card.Text>}
        <div className="d-flex gap-2 flex-wrap mb-3">
          <Button 
            variant="primary" 
            href={videoUrl} 
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Watch highlight: ${title}`}
          >
            Watch Highlight
          </Button>
          <FavoriteButton 
            highlightId={highlightIdValue} 
            title={title}
            highlightData={{
              idEvent: highlightIdValue,
              strEvent: title,
              strDescription: description,
              strVideo: videoUrl,
              dateEvent: date,
              strThumb: thumbnail,
              strLeague: league,
              highlightId: highlightIdValue
            }}
          />
        </div>
        <CommentSection highlightId={highlightIdValue} />
      </Card.Body>
    </Card>
  );
}
