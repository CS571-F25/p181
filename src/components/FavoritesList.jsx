import { useState, useEffect } from "react";
import { Card, Row, Col } from "react-bootstrap";
import HighlightCard from "./HighlightCard";
import LoadingSpinner from "./LoadingSpinner";

export default function FavoritesList() {
  const [favoriteHighlights, setFavoriteHighlights] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = () => {
    // Load favorites from localStorage
    const favorites = JSON.parse(localStorage.getItem("favoriteHighlights") || "[]");
    
    // Filter out any invalid entries and ensure we have proper structure
    const validFavorites = favorites.filter(fav => {
      if (typeof fav === "string") {
        // Legacy format - just an ID, create minimal object
        return true;
      }
      return fav && (fav.idEvent || fav.highlightId || fav.strEvent);
    }).map(fav => {
      if (typeof fav === "string") {
        // Legacy format - convert to object
        return {
          idEvent: fav,
          strEvent: "Favorite Highlight",
          strDescription: "One of your favorite highlights",
          strVideo: "https://www.youtube.com",
          dateEvent: new Date().toISOString().split("T")[0],
          highlightId: fav
        };
      }
      return fav;
    });
    
    setFavoriteHighlights(validFavorites);
    setLoading(false);
  };

  useEffect(() => {
    loadFavorites();
    
    // Listen for favorites updates
    const handleFavoritesUpdate = () => {
      loadFavorites();
    };
    
    window.addEventListener("favoritesUpdated", handleFavoritesUpdate);
    window.addEventListener("storage", handleFavoritesUpdate);
    
    // Also check periodically for same-tab changes
    const interval = setInterval(loadFavorites, 500);
    
    return () => {
      window.removeEventListener("favoritesUpdated", handleFavoritesUpdate);
      window.removeEventListener("storage", handleFavoritesUpdate);
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading favorites..." />;
  }

  if (favoriteHighlights.length === 0) {
    return (
      <Card>
        <Card.Body>
          <Card.Title as="h2">Your Favorites</Card.Title>
          <p className="text-muted">You haven't favorited any highlights yet. Click the heart icon on any highlight to add it to your favorites!</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div>
      <p className="text-muted mb-4">You have {favoriteHighlights.length} favorite highlight{favoriteHighlights.length !== 1 ? "s" : ""}</p>
      <Row>
        {favoriteHighlights.map((highlight) => {
          const highlightId = highlight.idEvent || highlight.highlightId || highlight;
          return (
            <Col key={highlightId} md={6} lg={4} className="mb-4">
              <HighlightCard
                title={highlight.strEvent || highlight.title || "Favorite Highlight"}
                description={highlight.strDescription || highlight.description || "One of your favorite highlights"}
                videoUrl={highlight.strVideo || highlight.videoUrl || "https://www.youtube.com"}
                highlightId={highlightId}
                date={highlight.dateEvent || highlight.date}
                thumbnail={highlight.strThumb || highlight.thumbnail}
                league={highlight.strLeague || highlight.league}
              />
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
