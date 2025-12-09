import { useState, useEffect } from "react";
import { Container, Card } from "react-bootstrap";
import FavoritesList from "../components/FavoritesList";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Favorites() {
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load favorite IDs from localStorage
    const favorites = JSON.parse(localStorage.getItem("favoriteHighlights") || "[]");
    setFavoriteIds(favorites);
    setLoading(false);
  }, []);

  // Listen for storage changes to update when favorites are added/removed
  useEffect(() => {
    const handleStorageChange = () => {
      const favorites = JSON.parse(localStorage.getItem("favoriteHighlights") || "[]");
      setFavoriteIds(favorites);
    };

    window.addEventListener("storage", handleStorageChange);
    // Also check periodically for same-tab changes
    const interval = setInterval(handleStorageChange, 500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <Container fluid className="favorites-page">
      <h1>Your Favorite Highlights</h1>
      <p className="lead">All the highlights you've saved for easy access</p>
      
      {loading ? (
        <LoadingSpinner message="Loading your favorites..." />
      ) : (
        <FavoritesList />
      )}
    </Container>
  );
}

