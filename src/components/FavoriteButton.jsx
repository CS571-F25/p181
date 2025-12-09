import { Button } from "react-bootstrap";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useState, useEffect } from "react";

export default function FavoriteButton({ highlightId, title, highlightData }) {
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    // Load favorites from localStorage
    const favorites = JSON.parse(localStorage.getItem("favoriteHighlights") || "[]");
    const favoriteIds = favorites.map(fav => fav.idEvent || fav.highlightId || fav);
    setIsFavorited(favoriteIds.includes(highlightId));
  }, [highlightId]);

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favoriteHighlights") || "[]");
    const favoriteIds = favorites.map(fav => fav.idEvent || fav.highlightId || fav);
    
    if (isFavorited) {
      const updated = favorites.filter(fav => {
        const id = fav.idEvent || fav.highlightId || fav;
        return id !== highlightId;
      });
      localStorage.setItem("favoriteHighlights", JSON.stringify(updated));
      setIsFavorited(false);
      // Trigger custom event for FavoritesList to update
      window.dispatchEvent(new Event("favoritesUpdated"));
    } else {
      // Store full highlight data if available, otherwise just ID
      const highlightToStore = highlightData || { 
        idEvent: highlightId, 
        strEvent: title,
        highlightId: highlightId
      };
      favorites.push(highlightToStore);
      localStorage.setItem("favoriteHighlights", JSON.stringify(favorites));
      setIsFavorited(true);
      // Trigger custom event for FavoritesList to update
      window.dispatchEvent(new Event("favoritesUpdated"));
    }
  };

  return (
    <Button
      variant={isFavorited ? "danger" : "outline-danger"}
      onClick={toggleFavorite}
      aria-label={isFavorited ? `Remove ${title} from favorites` : `Add ${title} to favorites`}
      aria-pressed={isFavorited}
    >
      {isFavorited ? <FaHeart /> : <FaRegHeart />}
      <span className="ms-2">{isFavorited ? "Favorited" : "Favorite"}</span>
    </Button>
  );
}

