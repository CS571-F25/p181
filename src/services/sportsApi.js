// API Configuration - Replace with your actual API keys
const API_KEYS = {
  API_SPORTS: "YOUR_API_SPORTS_KEY_HERE", // Get from https://api-sports.io/
  THE_SPORTS_DB: "YOUR_THE_SPORTS_DB_KEY_HERE", // Get from https://www.thesportsdb.com/api.php
  BALL_DONT_LIE: "f37e5272-8e07-42bc-9ca5-263c53682b76", // Get from https://www.balldontlie.io/ (free account required)
};

// Base URLs
const API_BASE_URLS = {
  API_SPORTS: "https://api.api-sports.io",
  THE_SPORTS_DB: "https://www.thesportsdb.com/api/v1/json",
  BALL_DONT_LIE: "https://api.balldontlie.io/v1", // No key needed
  NHL_STATS: "https://statsapi.web.nhl.com/api/v1", // No key needed
};

/**
 * Fetch NBA games/scores
 */
export async function fetchNBAGames(teamId = null) {
  try {
    // Using Ball Don't Lie API (requires free API key)
    if (API_KEYS.BALL_DONT_LIE === "YOUR_BALL_DONT_LIE_KEY_HERE") {
      return getMockNBAGames();
    }

    const url = teamId
      ? `${API_BASE_URLS.BALL_DONT_LIE}/games?team_ids[]=${teamId}&per_page=10`
      : `${API_BASE_URLS.BALL_DONT_LIE}/games?per_page=10`;
    
    const response = await fetch(url, {
      headers: {
        "Authorization": API_KEYS.BALL_DONT_LIE,
      },
    });
    
    if (!response.ok) {
      // 401/403 are expected when API key is missing/invalid - silently use mock data
      if (response.status === 401 || response.status === 403) {
        return getMockNBAGames();
      }
      throw new Error(`Failed to fetch NBA games: ${response.status}`);
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    // Only log unexpected errors (not 401/403)
    if (!error.message?.includes("401") && !error.message?.includes("403")) {
      console.error("Error fetching NBA games:", error);
    }
    // Return mock data as fallback
    return getMockNBAGames();
  }
}

/**
 * Fetch NFL games/scores
 */
export async function fetchNFLGames(teamId = null) {
  try {
    // Using API-Sports (requires key)
    if (API_KEYS.API_SPORTS === "YOUR_API_SPORTS_KEY_HERE") {
      return getMockNFLGames();
    }
    
    const url = teamId
      ? `${API_BASE_URLS.API_SPORTS}/nfl/games?team=${teamId}&season=2024`
      : `${API_BASE_URLS.API_SPORTS}/nfl/games?season=2024`;
    
    const response = await fetch(url, {
      headers: {
        "x-rapidapi-key": API_KEYS.API_SPORTS,
      },
    });
    
    if (!response.ok) {
      // 401/403 are expected when API key is invalid - silently use mock data
      if (response.status === 401 || response.status === 403) {
        return getMockNFLGames();
      }
      throw new Error(`Failed to fetch NFL games: ${response.status}`);
    }
    const data = await response.json();
    return data.response || [];
  } catch (error) {
    // Only log unexpected errors (not 401/403)
    if (!error.message?.includes("401") && !error.message?.includes("403")) {
      console.error("Error fetching NFL games:", error);
    }
    return getMockNFLGames();
  }
}

/**
 * Fetch MLB games/scores
 */
export async function fetchMLBGames(teamId = null) {
  try {
    // Using API-Sports (requires key)
    if (API_KEYS.API_SPORTS === "YOUR_API_SPORTS_KEY_HERE") {
      return getMockMLBGames();
    }
    
    const url = teamId
      ? `${API_BASE_URLS.API_SPORTS}/mlb/games?team=${teamId}&season=2024`
      : `${API_BASE_URLS.API_SPORTS}/mlb/games?season=2024`;
    
    const response = await fetch(url, {
      headers: {
        "x-rapidapi-key": API_KEYS.API_SPORTS,
      },
    });
    
    if (!response.ok) {
      // 401/403 are expected when API key is invalid - silently use mock data
      if (response.status === 401 || response.status === 403) {
        return getMockMLBGames();
      }
      throw new Error(`Failed to fetch MLB games: ${response.status}`);
    }
    const data = await response.json();
    return data.response || [];
  } catch (error) {
    // Only log unexpected errors (not 401/403)
    if (!error.message?.includes("401") && !error.message?.includes("403")) {
      console.error("Error fetching MLB games:", error);
    }
    return getMockMLBGames();
  }
}

/**
 * Fetch NHL games/scores
 */
export async function fetchNHLGames(teamId = null) {
  try {
    // Using official NHL Stats API (free, no key needed)
    const url = teamId
      ? `${API_BASE_URLS.NHL_STATS}/schedule?teamId=${teamId}&expand=schedule.linescore`
      : `${API_BASE_URLS.NHL_STATS}/schedule?expand=schedule.linescore`;
    
    const response = await fetch(url);
    if (!response.ok) {
      // 401/403 are expected in some cases - silently use mock data
      if (response.status === 401 || response.status === 403) {
        return getMockNHLGames();
      }
      throw new Error(`Failed to fetch NHL games: ${response.status}`);
    }
    const data = await response.json();
    return data.dates?.[0]?.games || [];
  } catch (error) {
    // Only log unexpected errors (not 401/403)
    if (!error.message?.includes("401") && !error.message?.includes("403")) {
      console.error("Error fetching NHL games:", error);
    }
    return getMockNHLGames();
  }
}

/**
 * Fetch highlights/videos from TheSportsDB
 */
export async function fetchHighlights(league, teamName = null) {
  try {
    // Validate league parameter
    if (!league || typeof league !== 'string') {
      return getMockHighlights(league || "NBA", teamName);
    }

    if (API_KEYS.THE_SPORTS_DB === "YOUR_THE_SPORTS_DB_KEY_HERE") {
      return getMockHighlights(league, teamName);
    }
    
    const leagueId = getLeagueId(league);
    if (!leagueId) {
      return getMockHighlights(league, teamName);
    }

    let url = `${API_BASE_URLS.THE_SPORTS_DB}/${API_KEYS.THE_SPORTS_DB}/eventspastleague.php?id=${leagueId}`;
    
    if (teamName) {
      url = `${API_BASE_URLS.THE_SPORTS_DB}/${API_KEYS.THE_SPORTS_DB}/searchevents.php?e=${encodeURIComponent(teamName)}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      // 401/403 are expected when API key is invalid - silently use mock data
      if (response.status === 401 || response.status === 403) {
        return getMockHighlights(league, teamName);
      }
      throw new Error(`Failed to fetch highlights: ${response.status}`);
    }
    const data = await response.json();
    return data.events || [];
  } catch (error) {
    // Only log unexpected errors (not 401/403)
    if (!error.message?.includes("401") && !error.message?.includes("403")) {
      console.error("Error fetching highlights:", error);
    }
    return getMockHighlights(league || "NBA", teamName);
  }
}

/**
 * Get team schedule for a specific team
 */
export async function fetchTeamSchedule(league, teamAbbr) {
  const games = await fetchGamesByLeague(league);
  // Filter by team abbreviation (this is a simplified approach)
  return games.filter(game => 
    game.homeTeam?.abbreviation === teamAbbr || 
    game.awayTeam?.abbreviation === teamAbbr
  );
}

/**
 * Fetch games by league
 */
export async function fetchGamesByLeague(league) {
  switch (league) {
    case "NBA":
      return await fetchNBAGames();
    case "NFL":
      return await fetchNFLGames();
    case "MLB":
      return await fetchMLBGames();
    case "NHL":
      return await fetchNHLGames();
    default:
      return [];
  }
}

// Helper functions
function getLeagueId(league) {
  const leagueIds = {
    NBA: "4387",
    NFL: "4391",
    MLB: "4424",
    NHL: "4380",
  };
  return leagueIds[league] || "4387";
}

// Mock data functions (fallback when API keys not set)
function getMockNBAGames() {
  return [
    {
      id: 1,
      date: new Date().toISOString(),
      home_team: { abbreviation: "LAL", full_name: "Los Angeles Lakers" },
      visitor_team: { abbreviation: "GSW", full_name: "Golden State Warriors" },
      home_team_score: 108,
      visitor_team_score: 104,
      status: "Final",
    },
    {
      id: 2,
      date: new Date(Date.now() + 86400000).toISOString(),
      home_team: { abbreviation: "BOS", full_name: "Boston Celtics" },
      visitor_team: { abbreviation: "MIA", full_name: "Miami Heat" },
      home_team_score: null,
      visitor_team_score: null,
      status: "Scheduled",
    },
  ];
}

function getMockNFLGames() {
  return [
    {
      id: 1,
      date: new Date().toISOString(),
      teams: {
        home: { name: "Kansas City Chiefs", abbreviation: "KC" },
        away: { name: "Buffalo Bills", abbreviation: "BUF" },
      },
      scores: { home: 24, away: 20 },
      status: { long: "Final" },
    },
  ];
}

function getMockMLBGames() {
  return [
    {
      id: 1,
      date: new Date().toISOString(),
      teams: {
        home: { name: "New York Yankees", abbreviation: "NYY" },
        away: { name: "Boston Red Sox", abbreviation: "BOS" },
      },
      scores: { home: 5, away: 3 },
      status: { long: "Final" },
    },
  ];
}

function getMockNHLGames() {
  return [
    {
      gamePk: 1,
      gameDate: new Date().toISOString(),
      teams: {
        home: { team: { name: "Boston Bruins", abbreviation: "BOS" } },
        away: { team: { name: "Toronto Maple Leafs", abbreviation: "TOR" } },
      },
      status: { abstractGameState: "Final" },
    },
  ];
}

function getMockHighlights(league, teamName) {
  const leagueName = league || "NBA";
  const eventName = teamName ? `${teamName} Game Highlights` : `${leagueName} Game Highlights`;
  
  return [
    {
      idEvent: "1",
      strEvent: eventName,
      strLeague: leagueName,
      dateEvent: new Date().toISOString().split("T")[0],
      strVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      strThumb: null, // No thumbnail for mock data
    },
    {
      idEvent: "2",
      strEvent: `${leagueName} Top Plays of the Week`,
      strLeague: leagueName,
      dateEvent: new Date().toISOString().split("T")[0],
      strVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      strThumb: null, // No thumbnail for mock data
    },
  ];
}

