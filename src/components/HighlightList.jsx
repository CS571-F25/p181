import { Row, Col } from "react-bootstrap";
import HighlightCard from "./HighlightCard";

export default function HighlightList({ highlights, league }) {
  if (!highlights || highlights.length === 0) {
    return (
      <div className="text-center py-5">
        <p className="text-muted">No highlights available at this time.</p>
      </div>
    );
  }

  // Only show up to 5 highlights if available
  const highlightsToShow = highlights.slice(0, 5);

  return (
    <Row>
      {highlightsToShow.map((highlight, index) => {
        // Create a unique key by combining ID, title, and index to ensure uniqueness
        const uniqueKey = `${highlight.idEvent || highlight.id || 'highlight'}-${highlight.strEvent || highlight.title || index}-${index}`;
        
        return (
          <Col key={uniqueKey} xs={12} md={6} lg={4} className="mb-3">
            <HighlightCard
              title={highlight.strEvent || highlight.title || "Game Highlights"}
              description={league === "MLB" ? "" : (highlight.strDescriptionEN || highlight.strDescription || highlight.description || `Recent ${league} highlights`)}
              videoUrl={highlight.strVideo || highlight.videoUrl || "#"}
              highlightId={highlight.idEvent || highlight.id || `highlight-${index}`}
              league={league}
              date={highlight.dateEvent || highlight.date}
              thumbnail={highlight.strThumb || highlight.thumbnail}
            />
          </Col>
        );
      })}
    </Row>
  );
}

