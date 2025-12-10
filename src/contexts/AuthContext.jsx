import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    // Load current user from localStorage
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  });

  // Load user data when user changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [currentUser]);

  const login = (username, password) => {
    const users = JSON.parse(localStorage.getItem("users") || "{}");
    const user = users[username];
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Simple password check (in production, use proper hashing)
    if (user.password !== password) {
      throw new Error("Incorrect password");
    }
    
    setCurrentUser({ username, isGuest: false });
    return true;
  };

  const signup = (username, password) => {
    const users = JSON.parse(localStorage.getItem("users") || "{}");
    
    if (users[username]) {
      throw new Error("Username already exists");
    }
    
    if (username.length < 3) {
      throw new Error("Username must be at least 3 characters");
    }
    
    if (password.length < 4) {
      throw new Error("Password must be at least 4 characters");
    }
    
    // Store user (in production, hash the password)
    users[username] = {
      password,
      preferences: {
        selectedTeams: [],
        favorites: [],
        comments: {}
      },
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem("users", JSON.stringify(users));
    setCurrentUser({ username, isGuest: false });
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const continueAsGuest = () => {
    setCurrentUser({ username: "guest", isGuest: true });
  };

  const getUserPreferences = () => {
    if (!currentUser || currentUser.isGuest) {
      // Guest users use default localStorage keys
      return {
        selectedTeams: JSON.parse(localStorage.getItem("selectedTeams") || "[]"),
        favorites: JSON.parse(localStorage.getItem("favoriteHighlights") || "[]"),
        comments: JSON.parse(localStorage.getItem("comments") || "{}")
      };
    }
    
    const users = JSON.parse(localStorage.getItem("users") || "{}");
    const user = users[currentUser.username];
    return user?.preferences || {
      selectedTeams: [],
      favorites: [],
      comments: {}
    };
  };

  const saveUserPreferences = (preferences) => {
    if (!currentUser || currentUser.isGuest) {
      // Guest users save to default localStorage keys
      if (preferences.selectedTeams !== undefined) {
        localStorage.setItem("selectedTeams", JSON.stringify(preferences.selectedTeams));
      }
      if (preferences.favorites !== undefined) {
        localStorage.setItem("favoriteHighlights", JSON.stringify(preferences.favorites));
      }
      if (preferences.comments !== undefined) {
        localStorage.setItem("comments", JSON.stringify(preferences.comments));
      }
      return;
    }
    
    const users = JSON.parse(localStorage.getItem("users") || "{}");
    const user = users[currentUser.username];
    if (user) {
      user.preferences = {
        ...user.preferences,
        ...preferences
      };
      users[currentUser.username] = user;
      localStorage.setItem("users", JSON.stringify(users));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        signup,
        logout,
        continueAsGuest,
        getUserPreferences,
        saveUserPreferences,
        isAuthenticated: !!currentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

