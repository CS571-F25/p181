import React, { createContext, useState, useContext } from "react";

// Create the context
const SelectedTeamsContext = createContext();

// Provider component
export function SelectedTeamsProvider({ children }) {
  const [selectedTeams, setSelectedTeams] = useState([]);

  // Function to toggle a team
  const toggleTeam = (teamAbbr) => {
    setSelectedTeams((prev) =>
      prev.includes(teamAbbr)
        ? prev.filter((t) => t !== teamAbbr)
        : [...prev, teamAbbr]
    );
  };

  return (
    <SelectedTeamsContext.Provider
      value={{ selectedTeams, setSelectedTeams, toggleTeam }}
    >
      {children}
    </SelectedTeamsContext.Provider>
  );
}

// Custom hook for easy access
export function useSelectedTeams() {
  return useContext(SelectedTeamsContext);
}
