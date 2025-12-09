import React, { createContext, useState, useContext, useEffect } from "react";

// Create the context
const SelectedTeamsContext = createContext();

// Provider component
export function SelectedTeamsProvider({ children }) {
  // Load from localStorage on mount
  const [selectedTeams, setSelectedTeams] = useState(() => {
    const saved = localStorage.getItem("selectedTeams");
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever selectedTeams changes
  useEffect(() => {
    localStorage.setItem("selectedTeams", JSON.stringify(selectedTeams));
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
