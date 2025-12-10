import { Button, Alert } from "react-bootstrap";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function FavoriteButton({ highlightId, title, highlightData }) {
  const { currentUser, getUserPreferences, saveUserPreferences } = useAuth();
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);
  const [showGuestAlert, setShowGuestAlert] = useState(false);

  useEffect(() => {
    // Load favorites from user preferences
    const prefs = getUserPreferences();
    const favorites = prefs.favorites || [];
    const favoriteIds = favorites.map(fav => fav.idEvent || fav.highlightId || fav);
    setIsFavorited(favoriteIds.includes(highlightId));
  }, [highlightId, getUserPreferences]);

  const toggleFavorite = () => {
    const prefs = getUserPreferences();
    const favorites = prefs.favorites || [];
    const favoriteIds = favorites.map(fav => fav.idEvent || fav.highlightId || fav);
    
    if (isFavorited) {
      // Allow guests to remove favorites if they have them
      const updated = favorites.filter(fav => {
        const id = fav.idEvent || fav.highlightId || fav;
        return id !== highlightId;
      });
      saveUserPreferences({ ...prefs, favorites: updated });
      setIsFavorited(false);
      // Trigger custom event for FavoritesList to update
      window.dispatchEvent(new Event("favoritesUpdated"));
    } else {
      // Check if user is a guest trying to add a favorite
      if (currentUser?.isGuest) {
        setShowGuestAlert(true);
        setTimeout(() => setShowGuestAlert(false), 3000);
        return;
      }
      
      // Store full highlight data if available, otherwise just ID
      const highlightToStore = highlightData || { 
        idEvent: highlightId, 
        strEvent: title,
        highlightId: highlightId
      };
      const updated = [...favorites, highlightToStore];
      saveUserPreferences({ ...prefs, favorites: updated });
      setIsFavorited(true);
      // Trigger custom event for FavoritesList to update
      window.dispatchEvent(new Event("favoritesUpdated"));
    }
  };

  return (
    <div>
      {showGuestAlert && (
        <Alert variant="warning" dismissible onClose={() => setShowGuestAlert(false)} className="mb-2">
          Please <a href="/login" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>login</a> or <a href="/signup" onClick={(e) => { e.preventDefault(); navigate("/signup"); }}>sign up</a> to favorite highlights.
        </Alert>
      )}
      <Button
        variant={isFavorited ? "danger" : "outline-danger"}
        onClick={toggleFavorite}
        aria-label={isFavorited ? `Remove ${title} from favorites` : `Add ${title} to favorites`}
        aria-pressed={isFavorited}
      >
        {isFavorited ? <FaHeart /> : <FaRegHeart />}
        <span className="ms-2">{isFavorited ? "Favorited" : "Favorite"}</span>
      </Button>
    </div>
  );
}

