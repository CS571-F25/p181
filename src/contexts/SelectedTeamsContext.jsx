import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";

// Create the context
const SelectedTeamsContext = createContext();

// Provider component
export function SelectedTeamsProvider({ children }) {
  const auth = useAuth();
  const { currentUser, getUserPreferences, saveUserPreferences } = auth || {};
  
  // Load from user preferences or localStorage (for guests)
  const [selectedTeams, setSelectedTeams] = useState(() => {
    if (auth && getUserPreferences) {
      try {
        const prefs = getUserPreferences();
        return prefs?.selectedTeams || [];
      } catch (e) {
        // Fallback if getUserPreferences fails
      }
    }
    // Fallback for when auth context isn't available yet
    const saved = localStorage.getItem("selectedTeams");
    return saved ? JSON.parse(saved) : [];
  });

  // Update when user changes
  useEffect(() => {
    if (auth && currentUser && getUserPreferences) {
      try {
        const prefs = getUserPreferences();
        setSelectedTeams(prefs?.selectedTeams || []);
      } catch (e) {
        // Fallback if getUserPreferences fails
      }
    }
  }, [currentUser?.username, currentUser?.isGuest]);

  // Save to user preferences whenever selectedTeams changes
  useEffect(() => {
    if (auth && saveUserPreferences) {
      try {
        const prefs = getUserPreferences ? getUserPreferences() : {};
        saveUserPreferences({
          ...prefs,
          selectedTeams
        });
      } catch (e) {
        // Fallback if save fails
        localStorage.setItem("selectedTeams", JSON.stringify(selectedTeams));
      }
    } else {
      // Fallback for when auth context isn't available
      localStorage.setItem("selectedTeams", JSON.stringify(selectedTeams));
    }
  }, [selectedTeams]);

  // Function to toggle a team
  const toggleTeam = (teamAbbr) => {
    setSelectedTeams((prev) =>
      prev.includes(teamAbbr)
        ? prev.filter((t) => t !== teamAbbr)
        : [...prev, teamAbbr]
    );
  };

  // Check if a team is selected
  const isTeamSelected = (teamAbbr) => {
    return selectedTeams.includes(teamAbbr);
  };

  return (
    <SelectedTeamsContext.Provider
      value={{ selectedTeams, setSelectedTeams, toggleTeam, isTeamSelected }}
    >
      {children}
    </SelectedTeamsContext.Provider>
  );
}

// Custom hook for easy access
export function useSelectedTeams() {
  return useContext(SelectedTeamsContext);
}
