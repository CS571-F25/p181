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
  GAMES: 30 * 60 * 1000, // 30 minutes for games (increased to reduce API calls when switching leagues)
  HIGHLIGHTS: 30 * 60 * 1000, // 30 minutes for highlights (less frequently updated)
};

// Global rate limit tracker - tracks when we last hit a rate limit (per league)
const lastRateLimitTime = {}; // Track per league to avoid blocking all leagues
const RATE_LIMIT_COOLDOWN = 15 * 1000; // 15 seconds cooldown after rate limit (reduced)

/**
 * Fetch with CORS proxy fallback
 * Since TheSportsDB doesn't allow direct browser requests, we use a CORS proxy
 * @param {string} url - The URL to fetch
 * @returns {Promise<Response>} The fetch response
 */
async function fetchWithCorsProxy(url) {
  // Try direct fetch first (in case CORS isn't an issue)
  try {
    const response = await fetch(url);
    // If we get a response (even if it's an error status), CORS worked
    return response;
  } catch (err) {
      // If direct fetch fails (likely CORS), use a CORS proxy
      if (err.message?.includes("CORS") || err.name === "TypeError" || err.message?.includes("Failed to fetch")) {
        // Silently use CORS proxy - no need to log this expected behavior
        // Use a public CORS proxy service
      // Note: For production, you should use your own backend proxy
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      
      try {
        const proxyResponse = await fetch(proxyUrl);
        if (!proxyResponse.ok) {
          throw new Error(`Proxy returned ${proxyResponse.status}`);
        }
        
        // The proxy returns JSON with the content in a 'contents' field
        const proxyData = await proxyResponse.json();
        
        // Parse the actual API response from the proxy
        let parsedData;
        try {
          parsedData = JSON.parse(proxyData.contents);
        } catch (parseErr) {
          // If parsing fails, the contents might already be an object
          parsedData = proxyData.contents;
        }
        
        // Create a Response-like object that works with our code
        return {
          ok: true,
          status: 200,
          json: async () => parsedData
        };
      } catch (proxyErr) {
        // Silently fail - will fall back to cached/mock data
        throw err; // Re-throw original error
      }
    }
    throw err; // Re-throw if it's not a CORS error
  }
}

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
    // Keep fetching days until we have 20 completed games (or hit 30 day limit)
    const allGames = await fetchGamesFromTheSportsDB('nba', 7, 20);
    
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
/**
 * Fetch games from TheSportsDB for a specific league
 * @param {string} league - League identifier (nfl, mlb, nhl, nba)
 * @param {number} days - Number of days to fetch (default: 7)
 * @param {number} targetCompletedGames - Target number of completed games to fetch (optional)
 * @returns {Promise<Array>} Array of games
 */
async function fetchGamesFromTheSportsDB(league, days = 7, targetCompletedGames = null) {
  const allGames = [];
  const today = new Date();
  let corsErrorOccurred = false;
  let wasRateLimited = false; // Track if we've been rate limited in this fetch
  let consecutiveEmptyDays = 0; // Track consecutive days with no games
  const maxDays = targetCompletedGames ? 30 : days; // Cap at 30 days if targeting specific count
  const MAX_EMPTY_DAYS = 5; // Stop if 5 consecutive days have no games
  
  // Check if we've been rate limited recently for THIS league - if so, wait before starting
  const leagueLastRateLimit = lastRateLimitTime[league] || 0;
  const timeSinceLastRateLimit = Date.now() - leagueLastRateLimit;
  if (timeSinceLastRateLimit < RATE_LIMIT_COOLDOWN) {
    const waitTime = RATE_LIMIT_COOLDOWN - timeSinceLastRateLimit;
    // Silently wait - rate limit cooldown is expected
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  // Fetch games for the specified number of days, or until we have enough completed games
  for (let i = 0; i < maxDays; i++) {
    // If CORS error occurred, stop trying more dates
    if (corsErrorOccurred) {
      // Silently stop - CORS errors are handled gracefully
      break;
    }
    
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    try {
      const url = `${API_BASE_URLS.THE_SPORTS_DB}/${API_KEYS.THE_SPORTS_DB}/eventsday.php?l=${league}&d=${dateStr}`;
      let response;
      
      try {
        response = await fetchWithCorsProxy(url);
      } catch (fetchErr) {
        // Check if this is a 429 error (rate limit) - sometimes it shows up as a network error
        if (fetchErr.message?.includes("429") || fetchErr.message?.includes("Too Many Requests")) {
          wasRateLimited = true;
          lastRateLimitTime[league] = Date.now(); // Update league-specific rate limit tracker
          // Silently wait - rate limiting is expected and handled
          await new Promise(resolve => setTimeout(resolve, 10000));
          
          // Check if we have enough games before continuing (be flexible - accept if close)
          if (targetCompletedGames) {
            const completedCount = allGames.filter(game => {
              const homeScore = game.intHomeScore;
              const awayScore = game.intAwayScore;
              return homeScore !== null && homeScore !== undefined && homeScore !== "" &&
                     awayScore !== null && awayScore !== undefined && awayScore !== "";
            }).length;
            
            // Accept if we're close to target (within 1 game) - be more lenient
            if (completedCount >= targetCompletedGames - 1) {
              // We have enough games - return immediately
              return allGames; // Return early to stop all processing
            }
          }
          continue;
        }
        // If it's a CORS error, check if we have enough games before stopping
        if (fetchErr.message?.includes("CORS") || fetchErr.name === "TypeError") {
          // Check if we have enough games (be flexible - accept 19 if target is 20)
          if (targetCompletedGames) {
            const completedCount = allGames.filter(game => {
              const homeScore = game.intHomeScore;
              const awayScore = game.intAwayScore;
              return homeScore !== null && homeScore !== undefined && homeScore !== "" &&
                     awayScore !== null && awayScore !== undefined && awayScore !== "";
            }).length;
            
            // Accept if we're close to target (within 1 game)
            if (completedCount >= targetCompletedGames - 1) {
              // We have enough games - return immediately
              return allGames; // Return early to stop all processing
            }
          }
          corsErrorOccurred = true;
          // Silently stop - CORS errors are handled gracefully
          break;
        }
        throw fetchErr; // Re-throw if it's not a known error
      }
      
      if (response.ok) {
        const data = await response.json();
        if (data.events && Array.isArray(data.events) && data.events.length > 0) {
          console.log(`[TheSportsDB ${league}] Fetched ${data.events.length} events for ${dateStr}`);
          allGames.push(...data.events);
          consecutiveEmptyDays = 0; // Reset counter when we find games
          
          // If we're targeting a specific number of completed games, check if we have enough
          if (targetCompletedGames) {
            const completedCount = allGames.filter(game => {
              const homeScore = game.intHomeScore;
              const awayScore = game.intAwayScore;
              return homeScore !== null && homeScore !== undefined && homeScore !== "" &&
                     awayScore !== null && awayScore !== undefined && awayScore !== "";
            }).length;
            
            // Accept if we've reached target OR are very close (within 1 game)
            // Be more lenient - if we're at 80% of target or more, accept it
            const minAcceptable = Math.max(targetCompletedGames - 1, Math.floor(targetCompletedGames * 0.8));
            if (completedCount >= targetCompletedGames) {
              // Target reached - stop immediately
              return allGames; // Return early to stop all processing
            } else if (completedCount >= minAcceptable && wasRateLimited) {
              // If we've been rate limited and are close (at least 80% of target), accept what we have
              return allGames; // Return early to stop all processing
            }
          }
        } else {
          // No events for this date
          consecutiveEmptyDays++;
          console.log(`[TheSportsDB ${league}] No events for ${dateStr} (${consecutiveEmptyDays} consecutive empty days)`);
          
          // If we've checked 5 consecutive days with no games, stop early
          if (consecutiveEmptyDays >= MAX_EMPTY_DAYS) {
            console.log(`[TheSportsDB ${league}] No games found in ${MAX_EMPTY_DAYS} consecutive days - stopping early`);
            break; // Stop fetching more days
          }
        }
        wasRateLimited = false; // Reset rate limit flag on success
      } else if (response.status === 429) {
        // Rate limited - wait much longer and skip this date, continue with next
        wasRateLimited = true;
        lastRateLimitTime[league] = Date.now(); // Update league-specific rate limit tracker
        // Silently wait - rate limiting is expected and handled
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
        
        // Check if we have enough games before continuing (be flexible - accept if close)
        if (targetCompletedGames) {
          const completedCount = allGames.filter(game => {
            const homeScore = game.intHomeScore;
            const awayScore = game.intAwayScore;
            return homeScore !== null && homeScore !== undefined && homeScore !== "" &&
                   awayScore !== null && awayScore !== undefined && awayScore !== "";
          }).length;
          
          // Accept if we're close to target (within 1 game) or at least 80% of target
          const minAcceptable = Math.max(targetCompletedGames - 1, Math.floor(targetCompletedGames * 0.8));
          if (completedCount >= minAcceptable) {
            // We have enough games - return immediately
            return allGames; // Return early to stop all processing
          }
        }
        // Continue to next date instead of breaking
        continue;
      } else {
        // Other HTTP errors - silently skip and continue
      }
      
      // ALWAYS add a delay between requests to avoid rate limiting
      // This delay happens even if there are no events, or if it's the last iteration
      // Increase delay if we were recently rate limited
      const baseDelay = wasRateLimited ? 2000 : 1500; // 2 seconds if rate limited, 1.5 seconds otherwise
      if (i < maxDays - 1) {
        await new Promise(resolve => setTimeout(resolve, baseDelay));
      } else {
        // Even on the last iteration, add a small delay to be safe
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (err) {
      // Handle other errors silently - will fall back to cached/mock data
      // Add delay even on errors to avoid hammering the API
      if (i < maxDays - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
  }
  
  // Log final status
  if (targetCompletedGames) {
    const finalCompletedCount = allGames.filter(game => {
      const homeScore = game.intHomeScore;
      const awayScore = game.intAwayScore;
      return homeScore !== null && homeScore !== undefined && homeScore !== "" &&
             awayScore !== null && awayScore !== undefined && awayScore !== "";
    }).length;
    console.log(`[TheSportsDB ${league}] Finished fetching: ${allGames.length} total games, ${finalCompletedCount} completed (target: ${targetCompletedGames})`);
  }
  
  // If we were rate limited, add an extra delay before returning to help prevent future rate limits
  if (wasRateLimited) {
    // Silently wait - rate limit recovery
    await new Promise(resolve => setTimeout(resolve, 3000));
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
    // Keep fetching days until we have 15 completed games (or hit 30 day limit)
    // NFL games are typically Thu/Sun/Mon, so we need to go back further
    // Reduced to 15 to avoid rate limiting
    const allGames = await fetchGamesFromTheSportsDB('nfl', 7, 15);
    
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
    
    console.log(`[NFL] Fetched ${allGames.length} total games, ${completedGames.length} have scores`);
    
    // Sort by date (most recent first) using dateEventLocal and strTimeLocal
    const sortedGames = completedGames.sort((a, b) => {
      const dateA = a.dateEventLocal ? new Date(`${a.dateEventLocal}T${a.strTimeLocal || '00:00:00'}`).getTime() : 0;
      const dateB = b.dateEventLocal ? new Date(`${b.dateEventLocal}T${b.strTimeLocal || '00:00:00'}`).getTime() : 0;
      return dateB - dateA; // Most recent first
    });
    
    // Return up to 15 games (reduced from 20 to avoid rate limiting)
    const result = sortedGames.slice(0, 15);
    
    console.log(`[NFL] Returning ${result.length} games to display (requested 15, filtered from ${allGames.length} total)`);
    
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
    // Keep fetching days until we have 20 completed games (or hit 30 day limit)
    const allGames = await fetchGamesFromTheSportsDB('mlb', 7, 20);
    
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
    // Keep fetching days until we have 20 completed games (or hit 30 day limit)
    // Note: CORS errors may occur - handled gracefully in fetchGamesFromTheSportsDB
    const allGames = await fetchGamesFromTheSportsDB('nhl', 7, 20);
    
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
 * Fetches until we have ~5 highlights with videos (similar to games fetching)
 */
export async function fetchHighlights(league, teamName = null, targetCount = 5) {
  try {
    // Validate league parameter
    if (!league || typeof league !== 'string') {
      return [];
    }

    // Check cache first
    const cacheKey = getCacheKey('highlights', league, teamName);
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Check if API key is valid (not a placeholder)
    if (!isValidTheSportsDBKey(API_KEYS.THE_SPORTS_DB)) {
      return [];
    }
    
    const leagueId = getLeagueId(league);
    if (!leagueId) {
      return [];
    }

    const allHighlights = [];
    const today = new Date();
    const maxDays = 30; // Cap at 30 days
    const leagueAbbr = league.toLowerCase();
    
    // Strategy: Fetch from recent dates until we have ~5 highlights with videos
    // Similar to how we fetch games
    
    for (let i = 0; i < maxDays; i++) {
      // Check if we have enough highlights with videos
      const highlightsWithVideos = allHighlights.filter(event => 
        event.strVideo && event.strVideo.trim() !== ""
      );
      
      if (highlightsWithVideos.length >= targetCount) {
        // We have enough highlights - stop fetching
        break;
      }
      
      try {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Use eventsday.php to get events from specific dates
        const dateUrl = `${API_BASE_URLS.THE_SPORTS_DB}/${API_KEYS.THE_SPORTS_DB}/eventsday.php?l=${leagueAbbr}&d=${dateStr}`;
        const dateResponse = await fetchWithCorsProxy(dateUrl);
        
        if (dateResponse.ok) {
          const dateData = await dateResponse.json();
          if (dateData.events && Array.isArray(dateData.events)) {
            // Add all events (we'll filter for videos later)
            allHighlights.push(...dateData.events);
          }
        }
        
        // Add delay between requests to avoid rate limiting
        if (i < maxDays - 1) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      } catch (err) {
        // Silently continue to next date
      }
    }
    
    // Remove duplicates based on idEvent
    const uniqueHighlights = [];
    const seenIds = new Set();
    for (const highlight of allHighlights) {
      const id = highlight.idEvent || highlight.id;
      if (id && !seenIds.has(id)) {
        seenIds.add(id);
        uniqueHighlights.push(highlight);
      }
    }
    
    // Filter to only include highlights that have videos
    const highlightsWithVideos = uniqueHighlights.filter(event => 
      event.strVideo && event.strVideo.trim() !== ""
    );
    
    // Ensure all events have the expected structure
    const processedEvents = highlightsWithVideos.map(event => ({
      ...event,
      // Ensure description field exists (use strDescriptionEN if available)
      strDescription: event.strDescriptionEN || event.strDescription || event.strDescriptionEN || "",
    }));
    
    // Sort by date (most recent first)
    processedEvents.sort((a, b) => {
      const dateA = a.dateEvent ? new Date(a.dateEvent).getTime() : 0;
      const dateB = b.dateEvent ? new Date(b.dateEvent).getTime() : 0;
      return dateB - dateA;
    });
    
    // Return up to targetCount (or a bit more if we're close)
    const result = processedEvents.slice(0, Math.max(targetCount, Math.floor(targetCount * 1.2)));
    
    // Cache the result
    setCachedData(cacheKey, result);
    
    return result;
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
    // Return empty array instead of mock data
    return [];
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

// Removed getMockHighlights - highlights now return empty array if none available

