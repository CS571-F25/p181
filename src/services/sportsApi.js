// API Configuration - Replace with your actual API keys
const API_KEYS = {
  API_SPORTS: "f75d2bf9950c9edcf001957364b58ef5", // Get from https://api-sports.io/
  THE_SPORTS_DB: "123", // Get from https://www.thesportsdb.com/api.php
  BALL_DONT_LIE: "f37e5272-8e07-42bc-9ca5-263c53682b76", // Get from https://www.balldontlie.io/ (free account required)
};

// Base URLs
const API_BASE_URLS = {
  API_SPORTS: "https://v1.american-football.api-sports.io", // API-Sports American Football endpoint
  THE_SPORTS_DB: "https://www.thesportsdb.com/api/v1/json", // Base URL (API key goes in path)
  BALL_DONT_LIE: "https://api.balldontlie.io/v1",
  NHL_STATS: "https://statsapi.web.nhl.com/api/v1", // No key needed
};

// Cache configuration
const CACHE_TTL = {
  GAMES: 10 * 60 * 1000, // 10 minutes for games (scores change frequently)
  HIGHLIGHTS: 30 * 60 * 1000, // 30 minutes for highlights (less frequently updated)
};

/**
 * Cache helper functions
 */
function getCacheKey(type, league, teamId = null) {
  return `sports_api_cache_${type}_${league}_${teamId || 'all'}`;
}

function getCachedData(cacheKey) {
  try {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid (within TTL)
    const ttl = cacheKey.includes('games') ? CACHE_TTL.GAMES : CACHE_TTL.HIGHLIGHTS;
    if (now - timestamp > ttl) {
      // Cache expired, remove it
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Error reading cache:", error);
    return null;
  }
}

function setCachedData(cacheKey, data) {
  try {
    const cacheEntry = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
  } catch (error) {
    console.error("Error writing cache:", error);
    // If storage is full, clear old caches
    clearOldCaches();
  }
}

function clearOldCaches() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('sports_api_cache_')) {
        const cached = localStorage.getItem(key);
        if (cached) {
          try {
            const { timestamp } = JSON.parse(cached);
            const now = Date.now();
            const ttl = key.includes('games') ? CACHE_TTL.GAMES : CACHE_TTL.HIGHLIGHTS;
            if (now - timestamp > ttl) {
              localStorage.removeItem(key);
            }
          } catch (e) {
            // Invalid cache entry, remove it
            localStorage.removeItem(key);
          }
        }
      }
    });
  } catch (error) {
    console.error("Error clearing old caches:", error);
  }
}

// Valid NBA team abbreviations (excluding G-League teams)
const VALID_NBA_ABBREVIATIONS = new Set([
  "ATL", "BOS", "BKN", "CHA", "CHI", "CLE", "DAL", "DEN", "DET", "GSW",
  "HOU", "IND", "LAC", "LAL", "MEM", "MIA", "MIL", "MIN", "NOP", "NYK",
  "OKC", "ORL", "PHI", "PHX", "POR", "SAC", "SAS", "TOR", "UTA", "WAS"
]);

/**
 * Check if a game is between valid NBA teams (not G-League)
 */
function isValidNBAGame(game) {
  if (!game || !game.home_team || !game.visitor_team) return false;
  
  const homeAbbr = game.home_team.abbreviation;
  const visitorAbbr = game.visitor_team.abbreviation;
  
  return VALID_NBA_ABBREVIATIONS.has(homeAbbr) && VALID_NBA_ABBREVIATIONS.has(visitorAbbr);
}

/**
 * Fetch NBA games/scores
 * Using Ball Don't Lie API - https://docs.balldontlie.io/
 * Implements caching to reduce API calls and avoid rate limits
 */
/**
 * Fetch NBA games/scores
 * Using TheSportsDB - https://www.thesportsdb.com/api/v1/json/123
 * Fetches last 3 days of games using eventsday.php (reduced to prevent rate limiting)
 */
export async function fetchNBAGames(teamId = null) {
  try {
    // Check cache first
    const cacheKey = getCacheKey('games', 'NBA', teamId);
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // TheSportsDB API for NBA games
    // Base URL: https://www.thesportsdb.com/api/v1/json/123
    // Endpoint: eventsday.php?l=nba&d={YYYY-MM-DD}
    // Fetch last 7 days of games to get more results
    const allGames = await fetchGamesFromTheSportsDB('nba', 7);
    
    console.log(`[NBA] Fetched ${allGames.length} total games from API`);
    if (allGames.length > 0) {
      console.log(`[NBA] Sample game:`, {
        id: allGames[0].idEvent,
        home: allGames[0].strHomeTeam,
        away: allGames[0].strAwayTeam,
        homeScore: allGames[0].intHomeScore,
        awayScore: allGames[0].intAwayScore,
        status: allGames[0].strStatus
      });
    }
    
    // If we got some games, process them; otherwise fall back to mock
    if (allGames.length === 0) {
      const staleCache = getCachedData(cacheKey);
      if (staleCache && staleCache.length > 0) {
        return staleCache;
      }
      const mockGames = getMockNBAGames();
      setCachedData(cacheKey, mockGames);
      return mockGames;
    }
    
    // Filter to only completed games (have scores)
    // Scores can be strings or numbers, so check both
    const completedGames = allGames.filter(game => {
      const homeScore = game.intHomeScore;
      const awayScore = game.intAwayScore;
      // Check if scores exist and are not empty/null
      const hasHomeScore = homeScore !== null && homeScore !== undefined && homeScore !== "";
      const hasAwayScore = awayScore !== null && awayScore !== undefined && awayScore !== "";
      return hasHomeScore && hasAwayScore;
    });
    
    console.log(`[NBA] After filtering, ${completedGames.length} games have scores (out of ${allGames.length} total)`);
    
    // Sort by date (most recent first) using dateEventLocal and strTimeLocal
    const sortedGames = completedGames.sort((a, b) => {
      const dateA = a.dateEventLocal ? new Date(`${a.dateEventLocal}T${a.strTimeLocal || '00:00:00'}`).getTime() : 0;
      const dateB = b.dateEventLocal ? new Date(`${b.dateEventLocal}T${b.strTimeLocal || '00:00:00'}`).getTime() : 0;
      return dateB - dateA; // Most recent first
    });
    
    // Return up to 20 games
    const result = sortedGames.slice(0, 20);
    
    console.log(`[NBA] Returning ${result.length} games to display`);
    
    // If no games found, return mock data
    if (result.length === 0) {
      const staleCache = getCachedData(cacheKey);
      if (staleCache && staleCache.length > 0) {
        return staleCache;
      }
      const mockGames = getMockNBAGames();
      setCachedData(cacheKey, mockGames);
      return mockGames;
    }
    
    // Cache the result
    setCachedData(cacheKey, result);
    
    return result;
  } catch (error) {
    // Handle network errors gracefully
    if (error.message?.includes("Failed to fetch") || 
        error.message?.includes("ERR_NAME_NOT_RESOLVED") ||
        error.name === "TypeError") {
      const cacheKey = getCacheKey('games', 'NBA', teamId);
      const cachedData = getCachedData(cacheKey);
      if (cachedData && cachedData.length > 0) {
        return cachedData;
      }
      return getMockNBAGames();
    }
    console.error("Error fetching NBA games:", error);
    return getMockNBAGames();
  }
}

/**
 * Helper function to fetch games from TheSportsDB for any league
 * @param {string} league - League identifier (nfl, mlb, nhl)
 * @param {number} days - Number of days to fetch (default: 3)
 */
async function fetchGamesFromTheSportsDB(league, days = 7) {
  const allGames = [];
  const today = new Date();
  
  // Fetch games for the specified number of days
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    try {
      const url = `${API_BASE_URLS.THE_SPORTS_DB}/${API_KEYS.THE_SPORTS_DB}/eventsday.php?l=${league}&d=${dateStr}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        if (data.events && Array.isArray(data.events)) {
          console.log(`[TheSportsDB ${league}] Fetched ${data.events.length} events for ${dateStr}`);
          allGames.push(...data.events);
        } else {
          console.log(`[TheSportsDB ${league}] No events array in response for ${dateStr}:`, data);
        }
      } else if (response.status === 429) {
        // Rate limited - stop trying more dates and use what we have
        console.warn(`Rate limited while fetching ${league.toUpperCase()} games - using available data`);
        break;
      }
      
      // Add a delay between requests to avoid rate limiting (except for last iteration)
      // Increased delay to 500ms to reduce rate limiting
      if (i < days - 1) {
        await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
      }
    } catch (err) {
      // Handle CORS and network errors gracefully
      if (err.message?.includes("CORS") || err.message?.includes("Failed to fetch")) {
        // CORS error - stop trying and use what we have
        console.warn(`CORS error while fetching ${league.toUpperCase()} games - using available data or mock`);
        break;
      }
      // Continue to next date for other errors
      console.warn(`Failed to fetch ${league.toUpperCase()} games for ${dateStr}:`, err);
    }
  }
  
  return allGames;
}

/**
 * Fetch NFL games/scores
 * Using TheSportsDB - https://www.thesportsdb.com/api/v1/json/123
 * Fetches last 3 days of games using eventsday.php (reduced to prevent rate limiting)
 */
export async function fetchNFLGames(teamId = null) {
  try {
    // Check cache first
    const cacheKey = getCacheKey('games', 'NFL', teamId);
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // TheSportsDB API for NFL games
    // Base URL: https://www.thesportsdb.com/api/v1/json/123
    // Endpoint: eventsday.php?l=nfl&d={YYYY-MM-DD}
    // Fetch last 7 days of games to get more results
    const allGames = await fetchGamesFromTheSportsDB('nfl', 7);
    
    console.log(`[NFL] Fetched ${allGames.length} total games from API`);
    if (allGames.length > 0) {
      console.log(`[NFL] Sample game:`, {
        id: allGames[0].idEvent,
        home: allGames[0].strHomeTeam,
        away: allGames[0].strAwayTeam,
        homeScore: allGames[0].intHomeScore,
        awayScore: allGames[0].intAwayScore,
        status: allGames[0].strStatus
      });
    }
    
    // If we got some games, process them; otherwise fall back to mock
    if (allGames.length === 0) {
      const staleCache = getCachedData(cacheKey);
      if (staleCache && staleCache.length > 0) {
        return staleCache;
      }
      const mockGames = getMockNFLGames();
      setCachedData(cacheKey, mockGames);
      return mockGames;
    }
    
    // Filter to only completed games (have scores)
    // Scores can be strings or numbers, so check both
    const completedGames = allGames.filter(game => {
      const homeScore = game.intHomeScore;
      const awayScore = game.intAwayScore;
      // Check if scores exist and are not empty/null
      const hasHomeScore = homeScore !== null && homeScore !== undefined && homeScore !== "";
      const hasAwayScore = awayScore !== null && awayScore !== undefined && awayScore !== "";
      return hasHomeScore && hasAwayScore;
    });
    
    console.log(`[NFL] After filtering, ${completedGames.length} games have scores (out of ${allGames.length} total)`);
    
    // Sort by date (most recent first) using dateEventLocal and strTimeLocal
    const sortedGames = completedGames.sort((a, b) => {
      const dateA = a.dateEventLocal ? new Date(`${a.dateEventLocal}T${a.strTimeLocal || '00:00:00'}`).getTime() : 0;
      const dateB = b.dateEventLocal ? new Date(`${b.dateEventLocal}T${b.strTimeLocal || '00:00:00'}`).getTime() : 0;
      return dateB - dateA; // Most recent first
    });
    
    // Return up to 20 games
    const result = sortedGames.slice(0, 20);
    
    console.log(`[NFL] Returning ${result.length} games to display`);
    
    // If no games found, return mock data
    if (result.length === 0) {
      const staleCache = getCachedData(cacheKey);
      if (staleCache && staleCache.length > 0) {
        return staleCache;
      }
      const mockGames = getMockNFLGames();
      setCachedData(cacheKey, mockGames);
      return mockGames;
    }
    
    // Cache the result
    setCachedData(cacheKey, result);
    
    return result;
  } catch (error) {
    // Handle network errors gracefully
    if (error.message?.includes("Failed to fetch") || 
        error.message?.includes("ERR_NAME_NOT_RESOLVED") ||
        error.name === "TypeError") {
      // Try to use cache on network errors
      const cacheKey = getCacheKey('games', 'NFL', teamId);
      const cachedData = getCachedData(cacheKey);
      if (cachedData && cachedData.length > 0) {
        return cachedData;
      }
      return getMockNFLGames();
    }
    console.error("Error fetching NFL games:", error);
    return getMockNFLGames();
  }
}

/**
 * Fetch MLB games/scores
 * Using TheSportsDB - https://www.thesportsdb.com/api/v1/json/123
 * Fetches last 3 days of games using eventsday.php
 */
export async function fetchMLBGames(teamId = null) {
  try {
    // Check cache first
    const cacheKey = getCacheKey('games', 'MLB', teamId);
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // TheSportsDB API for MLB games
    // Base URL: https://www.thesportsdb.com/api/v1/json/123
    // Endpoint: eventsday.php?l=mlb&d={YYYY-MM-DD}
    // Fetch last 7 days of games to get more results
    const allGames = await fetchGamesFromTheSportsDB('mlb', 7);
    
    // If we got some games, process them; otherwise fall back to mock
    if (allGames.length === 0) {
      const staleCache = getCachedData(cacheKey);
      if (staleCache && staleCache.length > 0) {
        return staleCache;
      }
      const mockGames = getMockMLBGames();
      setCachedData(cacheKey, mockGames);
      return mockGames;
    }
    
    // Filter to only completed games (have scores)
    // Scores can be strings or numbers, so check both
    const completedGames = allGames.filter(game => {
      const homeScore = game.intHomeScore;
      const awayScore = game.intAwayScore;
      // Check if scores exist and are not empty/null
      const hasHomeScore = homeScore !== null && homeScore !== undefined && homeScore !== "";
      const hasAwayScore = awayScore !== null && awayScore !== undefined && awayScore !== "";
      return hasHomeScore && hasAwayScore;
    });
    
    // Sort by date (most recent first) using dateEventLocal and strTimeLocal
    const sortedGames = completedGames.sort((a, b) => {
      const dateA = a.dateEventLocal ? new Date(`${a.dateEventLocal}T${a.strTimeLocal || '00:00:00'}`).getTime() : 0;
      const dateB = b.dateEventLocal ? new Date(`${b.dateEventLocal}T${b.strTimeLocal || '00:00:00'}`).getTime() : 0;
      return dateB - dateA; // Most recent first
    });
    
    // Return up to 20 games
    const result = sortedGames.slice(0, 20);
    
    // If no games found, return mock data
    if (result.length === 0) {
      const staleCache = getCachedData(cacheKey);
      if (staleCache && staleCache.length > 0) {
        return staleCache;
      }
      const mockGames = getMockMLBGames();
      setCachedData(cacheKey, mockGames);
      return mockGames;
    }
    
    // Cache the result
    setCachedData(cacheKey, result);
    
    return result;
  } catch (error) {
    // Handle network errors gracefully
    if (error.message?.includes("Failed to fetch") || 
        error.message?.includes("ERR_NAME_NOT_RESOLVED") ||
        error.name === "TypeError") {
      const cacheKey = getCacheKey('games', 'MLB', teamId);
      const cachedData = getCachedData(cacheKey);
      if (cachedData && cachedData.length > 0) {
        return cachedData;
      }
      return getMockMLBGames();
    }
    console.error("Error fetching MLB games:", error);
    return getMockMLBGames();
  }
}

/**
 * Fetch NHL games/scores
 * Using TheSportsDB - https://www.thesportsdb.com/api/v1/json/123
 * Fetches last 7 days of games using eventsday.php
 */
export async function fetchNHLGames(teamId = null) {
  try {
    // Check cache first
    const cacheKey = getCacheKey('games', 'NHL', teamId);
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // TheSportsDB API for NHL games
    // Base URL: https://www.thesportsdb.com/api/v1/json/123
    // Endpoint: eventsday.php?l=nhl&d={YYYY-MM-DD}
    // Fetch last 7 days of games to get more results
    const allGames = await fetchGamesFromTheSportsDB('nhl', 7);
    
    // If we got some games, process them; otherwise fall back to mock
    if (allGames.length === 0) {
      const staleCache = getCachedData(cacheKey);
      if (staleCache && staleCache.length > 0) {
        return staleCache;
      }
      const mockGames = getMockNHLGames();
      setCachedData(cacheKey, mockGames);
      return mockGames;
    }
    
    // Filter to only completed games (have scores)
    // Scores can be strings or numbers, so check both
    const completedGames = allGames.filter(game => {
      const homeScore = game.intHomeScore;
      const awayScore = game.intAwayScore;
      // Check if scores exist and are not empty/null
      const hasHomeScore = homeScore !== null && homeScore !== undefined && homeScore !== "";
      const hasAwayScore = awayScore !== null && awayScore !== undefined && awayScore !== "";
      return hasHomeScore && hasAwayScore;
    });
    
    // Sort by date (most recent first) using dateEventLocal and strTimeLocal
    const sortedGames = completedGames.sort((a, b) => {
      const dateA = a.dateEventLocal ? new Date(`${a.dateEventLocal}T${a.strTimeLocal || '00:00:00'}`).getTime() : 0;
      const dateB = b.dateEventLocal ? new Date(`${b.dateEventLocal}T${b.strTimeLocal || '00:00:00'}`).getTime() : 0;
      return dateB - dateA; // Most recent first
    });
    
    // Return up to 20 games
    const result = sortedGames.slice(0, 20);
    
    // If no games found, return mock data
    if (result.length === 0) {
      const staleCache = getCachedData(cacheKey);
      if (staleCache && staleCache.length > 0) {
        return staleCache;
      }
      const mockGames = getMockNHLGames();
      setCachedData(cacheKey, mockGames);
      return mockGames;
    }
    
    // Cache the result
    setCachedData(cacheKey, result);
    
    return result;
  } catch (error) {
    // Handle network errors gracefully
    if (error.message?.includes("Failed to fetch") || 
        error.message?.includes("ERR_NAME_NOT_RESOLVED") ||
        error.name === "TypeError") {
      const cacheKey = getCacheKey('games', 'NHL', teamId);
      const cachedData = getCachedData(cacheKey);
      if (cachedData && cachedData.length > 0) {
        return cachedData;
      }
      return getMockNHLGames();
    }
    console.error("Error fetching NHL games:", error);
    return getMockNHLGames();
  }
}

/**
 * Check if TheSportsDB API key is valid (not a placeholder)
 */
function isValidTheSportsDBKey(key) {
  if (!key || key === "YOUR_THE_SPORTS_DB_KEY_HERE") return false;
  // Check if it's a placeholder like "(Free User)" or similar
  // Note: "123" is the valid public read-only key for TheSportsDB
  if (key.includes("(Free User)") || key.includes("YOUR")) return false;
  // Allow "123" as it's the valid public read-only key
  if (key === "123") return true;
  // For other keys, require at least 5 characters
  if (key.length < 5) return false;
  return true;
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

    // Check cache first
    const cacheKey = getCacheKey('highlights', league, teamName);
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Check if API key is valid (not a placeholder)
    if (!isValidTheSportsDBKey(API_KEYS.THE_SPORTS_DB)) {
      return getMockHighlights(league, teamName);
    }
    
    const leagueId = getLeagueId(league);
    if (!leagueId) {
      return getMockHighlights(league, teamName);
    }

    // TheSportsDB API format: /api/v1/json/{apiKey}/endpoint
    // For league highlights: eventspastleague.php?id={leagueId}
    // For team search: searchevents.php?e={teamName}
    let url;
    if (teamName) {
      url = `${API_BASE_URLS.THE_SPORTS_DB}/${API_KEYS.THE_SPORTS_DB}/searchevents.php?e=${encodeURIComponent(teamName)}`;
    } else {
      url = `${API_BASE_URLS.THE_SPORTS_DB}/${API_KEYS.THE_SPORTS_DB}/eventspastleague.php?id=${leagueId}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      // Handle rate limiting
      if (response.status === 429) {
        console.warn("Rate limited - using cached data if available");
        const staleCache = getCachedData(cacheKey);
        if (staleCache) {
          return staleCache;
        }
        return getMockHighlights(league, teamName);
      }
      // 401/403/404 are expected when API key is invalid/missing - silently use mock data
      if (response.status === 401 || response.status === 403 || response.status === 404) {
        return getMockHighlights(league, teamName);
      }
      throw new Error(`Failed to fetch highlights: ${response.status}`);
    }
    const data = await response.json();
    const result = data.events || [];
    
    // Ensure all events have the expected structure
    // TheSportsDB returns events with fields like strEvent, strDescriptionEN, strVideo, strThumb, dateEvent, strLeague
    const processedEvents = result.map(event => ({
      ...event,
      // Ensure description field exists (use strDescriptionEN if available)
      strDescription: event.strDescriptionEN || event.strDescription || event.strDescriptionEN || "",
    }));
    
    // Cache the result
    setCachedData(cacheKey, processedEvents);
    
    return processedEvents;
  } catch (error) {
    // Try to use cache on errors
    const cacheKey = getCacheKey('highlights', league, teamName);
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    // Only log unexpected errors (not 401/403/404)
    if (!error.message?.includes("401") && !error.message?.includes("403") && !error.message?.includes("404")) {
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

/**
 * Get team logo URL from TheSportsDB
 * @param {string} league - League name (NBA, NFL, MLB, NHL)
 * @param {string} teamName - Full team name
 * @param {string} teamAbbr - Team abbreviation (fallback)
 * @returns {string} Logo URL or null
 */
export function getTeamLogoUrl(league, teamName, teamAbbr) {
  // TheSportsDB logo URL format: https://www.thesportsdb.com/images/media/team/badge/{teamId}.png
  // We'll use a search-based approach or direct URL construction
  
  // For now, return a URL that TheSportsDB might have
  // TheSportsDB uses team names in URLs, but it's not always consistent
  // Better approach: Cache team logos or use a mapping
  
  // Try to construct a potential logo URL
  // Note: This is a simplified approach - you may need to fetch team data first
  const baseUrl = "https://www.thesportsdb.com/images/media/team/badge";
  
  // Return null for now - we'll implement proper fetching
  return null;
}

/**
 * Fetch team logo URL from TheSportsDB API
 * First searches for the team, then uses lookupteam.php to get the banner/logo
 */
export async function fetchTeamLogo(league, teamName, teamAbbr) {
  try {
    if (!isValidTheSportsDBKey(API_KEYS.THE_SPORTS_DB)) {
      return null;
    }
    
    // TheSportsDB API format: /api/v1/json/{apiKey}/endpoint
    // First, search for the team to get the team ID
    const searchUrl = `${API_BASE_URLS.THE_SPORTS_DB}/${API_KEYS.THE_SPORTS_DB}/searchteams.php?t=${encodeURIComponent(teamName)}`;
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      return null;
    }
    
    const searchData = await searchResponse.json();
    if (!searchData.teams || searchData.teams.length === 0) {
      return null;
    }
    
    // Find team in the correct league
    const leagueId = getLeagueId(league);
    const team = searchData.teams.find(t => 
      t.idLeague === leagueId || 
      t.strLeague === league ||
      (t.strLeague && t.strLeague.toLowerCase().includes(league.toLowerCase()))
    );
    
    if (!team || !team.idTeam) {
      return null;
    }
    
    // Now use lookupteam.php to get the team details including banner
    // Format: /api/v1/json/{apiKey}/lookupteam.php?id={teamId}
    const lookupUrl = `${API_BASE_URLS.THE_SPORTS_DB}/${API_KEYS.THE_SPORTS_DB}/lookupteam.php?id=${team.idTeam}`;
    const lookupResponse = await fetch(lookupUrl);
    
    if (!lookupResponse.ok) {
      return null;
    }
    
    const lookupData = await lookupResponse.json();
    if (lookupData.teams && lookupData.teams.length > 0) {
      const teamData = lookupData.teams[0];
      // Prefer strBanner, fallback to strTeamBadge or strTeamLogo
      return teamData.strBanner || teamData.strTeamBadge || teamData.strTeamLogo || null;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching team logo:", error);
    return null;
  }
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
  const today = new Date();
  const games = [];
  
  // Generate 5 mock games from the past week
  for (let i = 1; i <= 5; i++) {
    const gameDate = new Date(today);
    gameDate.setDate(gameDate.getDate() - i);
    const dateStr = gameDate.toISOString().split('T')[0];
    
    const teams = [
      { home: "Kansas City Chiefs", away: "Buffalo Bills", homeScore: 24, awayScore: 20 },
      { home: "Dallas Cowboys", away: "Philadelphia Eagles", homeScore: 31, awayScore: 28 },
      { home: "San Francisco 49ers", away: "Seattle Seahawks", homeScore: 27, awayScore: 14 },
      { home: "Miami Dolphins", away: "New England Patriots", homeScore: 21, awayScore: 17 },
      { home: "Green Bay Packers", away: "Chicago Bears", homeScore: 35, awayScore: 24 },
    ];
    
    const team = teams[(i - 1) % teams.length];
    
    games.push({
      idEvent: `mock-nfl-${i}`,
      strEvent: `${team.away} vs ${team.home}`,
      strHomeTeam: team.home,
      strAwayTeam: team.away,
      intHomeScore: String(team.homeScore),
      intAwayScore: String(team.awayScore),
      strStatus: "Final",
      dateEvent: dateStr,
      dateEventLocal: dateStr,
      strTimeLocal: "20:00:00",
    });
  }
  
  return games;
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
      strDescriptionEN: `Recent ${leagueName} highlights and top plays`,
      strDescription: `Recent ${leagueName} highlights and top plays`,
      dateEvent: new Date().toISOString().split("T")[0],
      strVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      strThumb: null, // No thumbnail for mock data
    },
    {
      idEvent: "2",
      strEvent: `${leagueName} Top Plays of the Week`,
      strLeague: leagueName,
      strDescriptionEN: `Best plays and moments from ${leagueName} this week`,
      strDescription: `Best plays and moments from ${leagueName} this week`,
      dateEvent: new Date().toISOString().split("T")[0],
      strVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      strThumb: null, // No thumbnail for mock data
    },
    {
      idEvent: "3",
      strEvent: `${leagueName} Game Recap`,
      strLeague: leagueName,
      strDescriptionEN: `Full game recap and analysis from ${leagueName}.`,
      strDescription: `Full game recap and analysis from ${leagueName}.`,
      dateEvent: new Date().toISOString().split("T")[0],
      strVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      strThumb: null,
    },
    {
      idEvent: "4",
      strEvent: `${leagueName} Best Moments`,
      strLeague: leagueName,
      strDescriptionEN: `Compilation of the best moments from ${leagueName}.`,
      strDescription: `Compilation of the best moments from ${leagueName}.`,
      dateEvent: new Date().toISOString().split("T")[0],
      strVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      strThumb: null,
    },
    {
      idEvent: "5",
      strEvent: `${leagueName} Highlights Collection`,
      strLeague: leagueName,
      strDescriptionEN: `A collection of exciting highlights from ${leagueName}.`,
      strDescription: `A collection of exciting highlights from ${leagueName}.`,
      dateEvent: new Date().toISOString().split("T")[0],
      strVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      strThumb: null,
    },
  ];
}

