import { Row, Col } from "react-bootstrap";
import HighlightCard from "./HighlightCard";

export default function HighlightList({ highlights, league, fullSize = false, showAll = false }) {
  if (!highlights || highlights.length === 0) {
    return (
      <div className="text-center py-5">
        <p className="text-muted">No highlights available at this time.</p>
      </div>
    );
  }

  // Show all highlights if showAll is true, otherwise limit to 5
  const highlightsToShow = showAll ? highlights : highlights.slice(0, 5);

  // Column sizing:
  // - fullSize: full width (xs=12, md=6, lg=4) - for "All leagues" and Highlights page
  // - !fullSize: larger tiles for side-by-side with games (xs=12, md=12, lg=6) - 2 per row on large screens, 1 on smaller
  const colProps = fullSize 
    ? { xs: 12, md: 6, lg: 4 }  // Full size: 3 per row on large, 2 on medium, 1 on small
    : { xs: 12, md: 12, lg: 6 }; // Side-by-side: 2 per row on large, 1 on smaller screens

  return (
    <Row>
      {highlightsToShow.map((highlight, index) => {
        // Create a unique key by combining ID, title, and index to ensure uniqueness
        const uniqueKey = `${highlight.idEvent || highlight.id || 'highlight'}-${highlight.strEvent || highlight.title || index}-${index}`;
        
        return (
          <Col key={uniqueKey} {...colProps} className="mb-3">
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

